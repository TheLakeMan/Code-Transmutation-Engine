
import React, { UseState, UseReducer, UseCallback, UseEffect, UseRef } from 'React';
import { ProcessVisualizer } from './components/ProcessVisualizer';
import { HistoryLog } from './components/HistoryLog';
import { CodeEditor } from './components/CodeEditor';
import { IgnitionState, ProcessPhase, SavedSession, Language } from './types';
import { FlaskConical, Play, Square, RotateCcw, AlertTriangle, Info, ThermometerSun, ThermometerSnowflake, Save, FolderOpen, Check, Loader2, Code2, Copy, FileDown, Eraser, Lock, FileImage, ChevronDown, LayoutDashboard, Terminal } from 'lucide-react';
import { DetectLanguage } from './utils/languageDetector';
import { ExamplesDropdown } from './components/ExamplesDropdown';
import { AutogramReport } from './components/AutogramReport';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { CalculateMetrics } from './utils/codeMetrics';
import { Ignite } from './services/alchemyEngine';
import { OptimizeCode } from './services/optimizer/optimizerService';
import { RefactorResultPanel } from './components/RefactorResultPanel';
import { GetProvider, ListProviders } from './services/llm';
import type { LLMProviderId } from './services/llm/types';
import type { RefactorReport } from './services/optimizer/types';
import type { EngineMode } from './types/engine';

declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
      aistudio?: AIStudio;
    }
}

// Reducer Actions
type IgnitionAction = 
  | { type: 'UPDATE_STATE'; payload: Partial<IgnitionState> }
  | { type: 'RESET'; payload: { totalCycles: number } }
  | { type: 'RESTORE_SESSION'; payload: IgnitionState };

// Initial State Generator
const createInitialState = (totalCycles: number): IgnitionState => ({
  isProcessing: false,
  currentCycle: 0,
  totalCycles,
  phase: ProcessPhase.IDLE,
  sourceMaterial: "",
  currentState: "",
  history: [],
});

// Reducer Function
const ignitionReducer = (state: IgnitionState, action: IgnitionAction): IgnitionState => {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    case 'RESET':
      return createInitialState(action.payload.totalCycles);
    case 'RESTORE_SESSION':
      // Safe merge: Create a clean state based on saved cycles, then overlay saved data
      const baseState = createInitialState(action.payload.totalCycles || 0);
      return { 
          ...baseState, 
          ...action.payload, 
          isProcessing: false,
          // If restored while technically "processing", reset phase to IDLE to avoid stuck UI
          phase: (action.payload.phase === ProcessPhase.HEAT || action.payload.phase === ProcessPhase.COOL) 
            ? ProcessPhase.IDLE 
            : action.payload.phase 
      };
    default:
      return state;
  }
};

// URL State Helpers
const encodeState = (data: SavedSession): string => {
  try {
    const jsonStr = JSON.stringify(data);
    const bytes = new TextEncoder().encode(jsonStr);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return btoa(binString);
  } catch (e) {
    console.error("Encoding failed", e);
    return "";
  }
};

const decodeState = (base64: string): SavedSession | null => {
  try {
    const binString = atob(base64);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
    const jsonStr = new TextDecoder().decode(bytes);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Decoding failed", e);
    return null;
  }
};

const App: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [cycles, setCycles] = useState(2);
  const [heatTemp, setHeatTemp] = useState(1.1);
  const [coolTemp, setCoolTemp] = useState(0.3);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [language, setLanguage] = useState<Language>('python');
  const [engineMode, setEngineMode] = useState<EngineMode>('hallucination');
  const [providerId, setProviderId] = useState<LLMProviderId>('gemini');
  const [refactorReport, setRefactorReport] = useState<RefactorReport | null>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'analysis'>('editor');
  const providers = listProviders();

  // Auth state
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [state, dispatch] = useReducer(ignitionReducer, createInitialState(2));

  // Refs for Auto-save
  const stateRef = useRef({ inputText, cycles, heatTemp, coolTemp, ignitionState: state, engineMode, providerId });
  const lastSavedStr = useRef<string>("");
  const stopRef = useRef(false);

  // Derived state for current visualization
  const currentHeatText = state.history[state.history.length - 1]?.heatOutput || "";
  const currentCoolText = state.history[state.history.length - 1]?.coolOutput || "";
  
  // Heuristic to detect Autogram prompt
  const isAutogramTask = (inputText.toLowerCase().includes("self-descriptive") && inputText.toLowerCase().includes("autogram")) 
                      || inputText.includes("Autogram Validator");

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
  };

  // Check for API Key on mount
  useEffect(() => {
    const checkAuth = async () => {
        if (window.aistudio) {
            try {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setHasApiKey(hasKey);
            } catch (e) {
                console.error("Auth check failed", e);
            }
        } else {
            // Fallback for dev environment without bridge
            setHasApiKey(true);
        }
        setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  // Monitor for "Requested entity was not found" error which implies invalid key
  useEffect(() => {
    if (state.error && state.error.includes("Requested entity was not found")) {
        setHasApiKey(false);
        showNotification("API Key invalid or expired. Please sign in again.", "error");
    }
  }, [state.error]);

  const handleSelectKey = async () => {
      if (window.aistudio) {
          try {
              await window.aistudio.openSelectKey();
              // Assume success as per mitigation strategy
              setHasApiKey(true);
          } catch (e) {
              console.error("Key selection failed", e);
              showNotification("Failed to select API key", "error");
          }
      }
  };

  // Keep stateRef in sync for the interval
  useEffect(() => {
    stateRef.current = { inputText, cycles, heatTemp, coolTemp, ignitionState: state, engineMode, providerId };
  }, [inputText, cycles, heatTemp, coolTemp, state, engineMode, providerId]);

  // Auto-detect language
  useEffect(() => {
    if (!state.isProcessing && inputText) {
        const detected = detectLanguage(inputText);
        if (detected !== language) {
            setLanguage(detected);
        }
    }
  }, [inputText, state.isProcessing, language]);

  // Initialize lastSavedStr on mount with default values
  useEffect(() => {
    const initialContent = {
        inputText: "",
        cycles: 2,
        heatTemp: 1.1,
        coolTemp: 0.3,
        ignitionState: createInitialState(2),
        engineMode: 'hallucination' as EngineMode,
        providerId: 'gemini' as LLMProviderId
    };
    lastSavedStr.current = JSON.stringify(initialContent);
  }, []);

  // Auto-save Interval (2 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
        const currentContent = {
            inputText: stateRef.current.inputText,
            cycles: stateRef.current.cycles,
            heatTemp: stateRef.current.heatTemp,
            coolTemp: stateRef.current.coolTemp,
            ignitionState: stateRef.current.ignitionState,
            engineMode: stateRef.current.engineMode,
            providerId: stateRef.current.providerId
        };
        const currentStr = JSON.stringify(currentContent);

        if (currentStr !== lastSavedStr.current) {
            try {
                const session: SavedSession = {
                    ...currentContent,
                    timestamp: Date.now()
                };
                localStorage.setItem('alchemy_session', JSON.stringify(session));
                lastSavedStr.current = currentStr;
                showNotification("Auto-saved session");
            } catch (e) {
                console.error("Auto-save failed", e);
            }
        }
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Restore from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedState = params.get('s');
    if (encodedState) {
      const session = decodeState(encodedState);
      if (session) {
        setInputText(session.inputText);
        setCycles(session.cycles);
        setHeatTemp(session.heatTemp);
        setCoolTemp(session.coolTemp);
        setEngineMode(session.engineMode || 'hallucination');
        setProviderId(session.providerId || 'gemini');
        dispatch({ type: 'RESTORE_SESSION', payload: session.ignitionState });
        setEditorKey(prev => prev + 1);
        
        // Update ref to prevent immediate auto-save
        const content = {
            inputText: session.inputText,
            cycles: session.cycles,
            heatTemp: session.heatTemp,
            coolTemp: session.coolTemp,
            ignitionState: session.ignitionState,
            engineMode: session.engineMode,
            providerId: session.providerId
        };
        lastSavedStr.current = JSON.stringify(content);

        showNotification("State restored from shared link");
        
        // Clean URL without reloading
        const url = new URL(window.location.href);
        url.searchParams.delete('s');
        try {
            window.history.replaceState({}, '', url.toString());
        } catch (e) {
            console.warn("Could not clean URL history (likely in sandbox)", e);
        }
      } else {
        showNotification("Invalid shared link", 'error');
      }
    }
  }, []);

  const handleStart = useCallback(async () => {
    if (!inputText.trim()) return;

    const provider = getProvider(providerId);
    stopRef.current = false;
    setRefactorReport(null);

    dispatch({
        type: 'UPDATE_STATE',
        payload: {
            totalCycles: cycles,
            isProcessing: true,
            error: undefined,
            activeModel: provider.displayName,
            sourceMaterial: inputText,
            currentState: inputText,
            history: [],
            currentCycle: 0,
            phase: ProcessPhase.IDLE
        }
    });

    try {
      if (engineMode === 'hallucination') {
        const cycleHistory: typeof state.history = [];
        await ignite({
          sourceCode: inputText,
          cycles,
          heatTemp,
          coolTemp,
          provider,
          shouldStop: () => stopRef.current,
          onPhaseChange: (phase) => {
            dispatch({ type: 'UPDATE_STATE', payload: { phase, currentCycle: cycleHistory.length + (phase === ProcessPhase.COOL ? 1 : 0) } });
          },
          onUpdate: (cycle) => {
            cycleHistory.push(cycle);
            dispatch({
              type: 'UPDATE_STATE',
              payload: {
                currentState: cycle.coolOutput,
                history: [...cycleHistory],
                currentCycle: cycle.cycleNumber,
                phase: ProcessPhase.COOL
              }
            });
          }
        });

        dispatch({
          type: 'UPDATE_STATE',
          payload: {
            isProcessing: false,
            phase: stopRef.current ? ProcessPhase.IDLE : ProcessPhase.COMPLETE,
            currentCycle: cycleHistory.length,
            currentState: cycleHistory[cycleHistory.length - 1]?.coolOutput || inputText
          }
        });
      } else {
        dispatch({ type: 'UPDATE_STATE', payload: { phase: ProcessPhase.HEAT } });
        const report = await optimizeCode({
          code: inputText,
          language,
          goals: ['readability', 'reduce-complexity'],
          provider,
        });

        setRefactorReport(report);
        const syntheticMetrics = calculateMetrics(report.originalCode, report.optimizedCode);
        const syntheticHistory = [{
          cycleNumber: 1,
          heatOutput: report.originalCode,
          coolOutput: report.optimizedCode,
          timestamp: Date.now(),
          metrics: syntheticMetrics,
          sourceMaterial: report.originalCode
        }];

        dispatch({
          type: 'UPDATE_STATE',
          payload: {
            history: syntheticHistory,
            currentState: report.optimizedCode,
            sourceMaterial: report.originalCode,
            isProcessing: false,
            phase: ProcessPhase.COMPLETE,
            currentCycle: 1,
            totalCycles: syntheticHistory.length
          }
        });
      }
    } catch (error: any) {
      console.error(error);
      dispatch({
        type: 'UPDATE_STATE',
        payload: {
          phase: ProcessPhase.ERROR,
          isProcessing: false,
          error: error?.message || 'An alchemical misalignment occurred.'
        }
      });
    }
  }, [inputText, cycles, heatTemp, coolTemp, providerId, engineMode, language]);

  const handleStop = useCallback(() => {
    stopRef.current = true;
    dispatch({
        type: 'UPDATE_STATE',
        payload: {
            isProcessing: false,
            phase: ProcessPhase.IDLE
        }
    });
  }, []);

  const handleReset = () => {
    setInputText("");
    setHeatTemp(1.1);
    setCoolTemp(0.3);
    setCycles(2);
    setEngineMode('hallucination');
    setProviderId('gemini');
    setRefactorReport(null);
    dispatch({ type: 'RESET', payload: { totalCycles: 2 } });
    setEditorKey(prev => prev + 1);
  };

  const handleClear = () => {
    setInputText("");
    setRefactorReport(null);
    // Keep settings, just clear text
    dispatch({ type: 'UPDATE_STATE', payload: { sourceMaterial: "", currentState: "", history: [], phase: ProcessPhase.IDLE, error: undefined } });
    setEditorKey(prev => prev + 1);
  };

  const handleLoadExample = (text: string, lang: Language) => {
      setInputText(text);
      setLanguage(lang); // Optimistic update, effect will confirm
      setEditorKey(prev => prev + 1);
  }

  const handleSaveSession = () => {
      try {
          const content = {
              inputText,
              cycles,
              heatTemp,
              coolTemp,
              ignitionState: state,
              engineMode,
              providerId
          };
          const session: SavedSession = {
              ...content,
              timestamp: Date.now()
          };
          
          // Attempt to save
          localStorage.setItem('alchemy_session', JSON.stringify(session));
          
          lastSavedStr.current = JSON.stringify(content);
          showNotification("Session saved to Local Storage");
      } catch (e: any) {
          console.error(e);
          if (e.name === 'QuotaExceededError') {
              showNotification("Storage full: Clear browser data", 'error');
          } else {
              // Handle security errors in sandboxes where localStorage is denied
              showNotification("Failed to save (Storage restricted)", 'error');
          }
      }
  };

  const handleLoadSession = () => {
      try {
          const raw = localStorage.getItem('alchemy_session');
          if (!raw) {
              showNotification("No saved session found", 'error');
              return;
          }
          const session: SavedSession = JSON.parse(raw);
          
          if (!session.inputText) throw new Error("Invalid session data");

          setInputText(session.inputText);
          setCycles(session.cycles);
          setHeatTemp(session.heatTemp);
          setCoolTemp(session.coolTemp);
          setEngineMode(session.engineMode || 'hallucination');
          setProviderId(session.providerId || 'gemini');

          dispatch({ type: 'RESTORE_SESSION', payload: session.ignitionState });
          setEditorKey(prev => prev + 1);
          
          const content = {
              inputText: session.inputText,
              cycles: session.cycles,
              heatTemp: session.heatTemp,
              coolTemp: session.coolTemp,
              ignitionState: session.ignitionState,
              engineMode: session.engineMode,
              providerId: session.providerId
          };
          lastSavedStr.current = JSON.stringify(content);
          
          showNotification("Session restored successfully");
      } catch (e) {
          console.error(e);
          showNotification("Failed to load session", 'error');
      }
  };

  const handleDownloadReport = useCallback(() => {
    const timestamp = new Date().toLocaleString();
    const source = state.sourceMaterial || inputText;
    const final = state.currentState || source;
    const modelLabel = state.activeModel || getProvider(providerId)?.displayName || providerId;

    // Markdown Content Generation
    let mdContent = `# Code Transmutation Report
Generated: ${timestamp}
Model: ${modelLabel}

## Configuration
- Mutation Cycles: ${cycles}
- Entropy (Heat): ${heatTemp}
- Stabilization (Cool): ${coolTemp}

## Source Anchor
\`\`\`${language}
${source}
\`\`\`
`;

    if (state.history.length > 0) {
        mdContent += `\n## Transmutation Log\n`;
        state.history.forEach(cycle => {
            mdContent += `
### Cycle ${cycle.cycleNumber}
**Phase 1: Entropy (Heat)**
\`\`\`
${cycle.heatOutput}
\`\`\`

**Phase 2: Stabilization (Cool)**
\`\`\`
${cycle.coolOutput}
\`\`\`
`;
        });
    }

    mdContent += `\n## Final Evolution
\`\`\`${language}
${final}
\`\`\`
`;

    try {
        const blob = new Blob([mdContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const element = document.createElement('a');
        element.href = url;
        element.download = `transmutation_report_${Date.now()}.md`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(url);
        showNotification("Report downloaded as Markdown");
    } catch (e) {
        console.error("Download failed", e);
        showNotification("Failed to download report", "error");
    }
  }, [state, cycles, heatTemp, coolTemp, inputText, language, providerId]);

  const handleDownloadImage = useCallback(async () => {
    // @ts-ignore
    if (typeof window.html2canvas === 'undefined') {
        showNotification("Image generator not loaded yet", "error");
        return;
    }

    showNotification("Generating PNG Report...");

    const timestamp = new Date().toLocaleString();
    const source = state.sourceMaterial || inputText;
    const final = state.currentState || source;

    // Create a container to render the report for capture
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.padding = '40px';
    container.style.backgroundColor = '#0f172a';
    container.style.color = '#e2e8f0';
    container.style.position = 'fixed';
    container.style.top = '-10000px';
    container.style.left = '-10000px';
    container.style.zIndex = '-100';

    const styles = `
        font-family: system-ui, -apple-system, sans-serif;
        line-height: 1.5;
        .header { border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 30px; }
        .title { color: #f97316; font-size: 24px; font-weight: bold; margin: 0; }
        .meta { color: #94a3b8; font-size: 14px; margin-top: 10px; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
        .card { background: #1e293b; padding: 15px; border-radius: 8px; border: 1px solid #334155; }
        .label { font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; display: block; }
        .value { font-size: 16px; font-weight: bold; color: #f8fafc; font-family: monospace; }
        .section-title { color: #38bdf8; font-size: 18px; margin: 30px 0 15px 0; border-left: 3px solid #38bdf8; padding-left: 10px; }
        .code-block { background: #020617; padding: 20px; border-radius: 8px; border: 1px solid #1e293b; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #a5b4fc; white-space: pre-wrap; word-break: break-all; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #1e293b; text-align: center; color: #64748b; font-size: 12px; }
        .cycle { margin-top: 20px; border: 1px solid #334155; border-radius: 8px; padding: 15px; background: rgba(30, 41, 59, 0.3); }
        .cycle-tag { display: inline-block; background: #334155; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
    `;

    let contentHtml = `
        <style>${styles}</style>
        <div class="header">
            <h1 class="title">Code Transmutation Report</h1>
            <div class="meta">Generated: ${timestamp}</div>
        </div>
        
        <div class="grid">
            <div class="card"><span class="label">Cycles</span><span class="value">${cycles}</span></div>
            <div class="card"><span class="label">Model</span><span class="value">${modelLabel}</span></div>
            <div class="card"><span class="label">Entropy</span><span class="value">${heatTemp}</span></div>
            <div class="card"><span class="label">Stabilization</span><span class="value">${coolTemp}</span></div>
        </div>

        <div class="section-title">Source Anchor</div>
        <div class="code-block">${(source || "").slice(0, 800)}${source.length > 800 ? '...' : ''}</div>
    `;

    if (state.history.length > 0) {
        // Only include the last cycle details to prevent image becoming massive
        const lastCycle = state.history[state.history.length - 1];
        contentHtml += `
            <div class="cycle">
                <div class="cycle-tag">CYCLE ${lastCycle.cycleNumber} (LAST)</div>
                <span class="label" style="color:#fdba74">Mutation (Entropy)</span>
                <div class="code-block" style="background:#2a1205; border-color:#7c2d12; color:#fdba74; margin-bottom:10px;">${lastCycle.heatOutput.slice(0, 400)}...</div>
                
                <span class="label" style="color:#bae6fd">Stabilization</span>
                <div class="code-block" style="background:#081826; border-color:#0c4a6e; color:#bae6fd;">${lastCycle.coolOutput.slice(0, 400)}...</div>
            </div>`;
    }

    contentHtml += `
        <div class="section-title">Final Evolution</div>
        <div class="code-block" style="border-color: #10b981; background: rgba(6, 78, 59, 0.1); color: #6ee7b7;">${(final || "").slice(0, 1500)}</div>
        
        <div class="footer">Generated by Code Transmutation Engine</div>
    `;

    container.innerHTML = contentHtml;
    document.body.appendChild(container);

    try {
        // @ts-ignore
        const canvas = await window.html2canvas(container, {
            backgroundColor: '#0f172a',
            scale: 2 // High resolution
        });
        
        const link = document.createElement('a');
        link.download = `transmutation_report_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showNotification("Report downloaded as PNG");
    } catch (e) {
        console.error("PNG generation failed", e);
        showNotification("Failed to generate image", "error");
    } finally {
        document.body.removeChild(container);
    }
  }, [state, cycles, heatTemp, coolTemp, inputText, providerId]);

  const handleShare = async () => {
    const session: SavedSession = {
      inputText,
      cycles,
      heatTemp,
      coolTemp,
      ignitionState: state,
      timestamp: Date.now(),
      engineMode,
      providerId
    };
    
    // 1. Try encoding full session
    let encoded = encodeState(session);
    
    // 2. If too large for URL (conservative 8KB limit), strip history
    if (encoded.length > 8000) {
      const reducedSession = {
        ...session,
        ignitionState: { ...state, history: [] } // Remove history
      };
      encoded = encodeState(reducedSession);
    }

    if (!encoded) {
      showNotification("Failed to generate link (Data too large)", 'error');
      return;
    }

    // 3. Update URL bar
    const url = new URL(window.location.href);
    url.searchParams.set('s', encoded);
    
    try {
        window.history.pushState({}, '', url.toString());
    } catch (e) {
        console.warn("Could not update URL history", e);
    }

    // 4. Construct Tweet with Evals
    const modelLabel = state.activeModel || getProvider(providerId)?.displayName || providerId;
    const tweetText = `Code Transmutation Engine Report 🧬\n\nI just evolved some code through ${cycles} quantum cycles.\n\nEvals:\n🔥 Entropy: ${heatTemp}\n❄️ Stabilization: ${coolTemp}\n🤖 Model: ${modelLabel}\n\nWitness the transmutation:`;
    
    const shareUrl = url.toString();
    const twitterIntent = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
    
    window.open(twitterIntent, '_blank');
    showNotification("Opened X (Twitter) share window");
  };

  const handleCopyResult = async () => {
    const textToCopy = state.currentState || state.sourceMaterial;
    if (!textToCopy) return;
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        showNotification("Optimized code copied to clipboard");
    } catch (err) {
        console.error("Failed to copy", err);
        showNotification("Failed to copy code", 'error');
    }
  };

  if (isCheckingAuth) {
    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-magma-500 animate-spin" />
        </div>
    );
  }

  if (!hasApiKey) {
      return (
          <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl backdrop-blur animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-inner ring-1 ring-slate-800">
                      <Code2 className="w-8 h-8 text-magma-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">Code Transmutation Engine</h1>
                  <p className="text-slate-400 mb-8 leading-relaxed">
                      Connect your Google account to provide an API key for the transmutation process.
                  </p>
                  
                  <button 
                      onClick={handleSelectKey}
                      className="w-full bg-white hover:bg-slate-200 text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                      <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center bg-white">
                         <span className="font-bold text-xs">G</span>
                      </div>
                      Sign in with Google
                  </button>
                   <div className="mt-8 text-xs text-slate-500 flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1.5">
                          <Lock className="w-3 h-3" />
                          <span>Secure Connection</span>
                      </div>
                      <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="hover:text-magma-500 underline decoration-slate-700 underline-offset-4 transition-colors">
                          Billing Information
                      </a>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-magma-500/30 selection:text-magma-100">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-24 right-6 z-50 px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 animate-in slide-in-from-right fade-in duration-300 ${
            notification.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100' 
                : 'bg-red-950/90 border-red-500/50 text-red-100'
        }`}>
            {notification.type === 'success' ? <Check className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
            <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                <Code2 className="w-6 h-6 text-magma-500" />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    Code Transmutation Engine
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <div className="bg-slate-800 rounded-lg p-1 border border-slate-700 flex">
                    <button
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${engineMode === 'hallucination' ? 'bg-magma-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      onClick={() => setEngineMode('hallucination')}
                      disabled={state.isProcessing}
                    >
                      Hallucination Lab
                    </button>
                    <button
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${engineMode === 'optimizer' ? 'bg-frost-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      onClick={() => setEngineMode('optimizer')}
                      disabled={state.isProcessing}
                    >
                      Refactor Tool
                    </button>
                  </div>
                  <div className="relative group">
                        <select
                            value={providerId}
                            onChange={(e) => setProviderId(e.target.value as LLMProviderId)}
                            disabled={state.isProcessing}
                            className="appearance-none bg-slate-800 border border-slate-700 text-slate-400 text-[10px] uppercase tracking-wider pl-2 pr-6 py-0.5 rounded font-mono hover:border-slate-500 focus:outline-none focus:border-magma-500 cursor-pointer disabled:opacity-50 transition-colors"
                        >
                            {providers.map((p) => (
                              <option key={p.id} value={p.id}>{p.displayName}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
                <p className="text-xs text-slate-500 font-mono hidden sm:block">SOURCE_SPEC + ENTROPY({heatTemp}) + STABILIZATION({coolTemp}) = EVOLUTION</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="hidden sm:flex bg-slate-800 rounded-lg p-1 mr-2 border border-slate-700">
                 <button
                    onClick={() => setViewMode('editor')}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'editor' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                 >
                     <Terminal className="w-3 h-3" /> Editor
                 </button>
                 <button
                    onClick={() => setViewMode('analysis')}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'analysis' ? 'bg-magma-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    disabled={state.history.length === 0}
                    title={state.history.length === 0 ? "Generate code to view analysis" : "View Analysis"}
                 >
                     <LayoutDashboard className="w-3 h-3" /> Analysis
                 </button>
             </div>
             <button 
                onClick={handleShare}
                disabled={state.isProcessing}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Share to X"
             >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
             </button>
             <div className="w-px h-6 bg-slate-700 mx-1"></div>
             <button 
                onClick={handleDownloadReport}
                disabled={state.isProcessing}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download Report (.md)"
             >
                <FileDown className="w-5 h-5" />
             </button>
             <button 
                onClick={handleDownloadImage}
                disabled={state.isProcessing}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download Report Image (.png)"
             >
                <FileImage className="w-5 h-5" />
             </button>
             <button 
                onClick={handleSaveSession}
                disabled={state.isProcessing}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Save Session to Local Storage"
             >
                <Save className="w-5 h-5" />
             </button>
             <button 
                onClick={handleLoadSession}
                disabled={state.isProcessing}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Load Session from Local Storage"
             >
                <FolderOpen className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Error Banner */}
        {state.error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                    <h3 className="text-red-400 font-bold text-sm">Transmutation Error</h3>
                    <p className="text-red-200/80 text-sm mt-1">{state.error}</p>
                </div>
            </div>
        )}

        {engineMode === 'optimizer' && refactorReport && (
          <div className="mb-8">
            <RefactorResultPanel report={refactorReport} />
          </div>
        )}

        {viewMode === 'analysis' && state.history.length > 0 ? (
           <AnalysisDashboard history={state.history} />
        ) : (
           <>
            {/* Input & Controls Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Input */}
                <div className="lg:col-span-2 space-y-4">
                    <label className="flex items-center justify-between text-sm font-semibold text-slate-400">
                        <span className="flex items-center gap-2">
                            Source Code (Immutable Logic)
                            <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 rounded uppercase">{language}</span>
                        </span>
                        <div className="flex items-center gap-3">
                             <ExamplesDropdown 
                                onSelect={handleLoadExample} 
                                disabled={state.isProcessing} 
                             />
                            <button 
                              onClick={handleClear}
                              disabled={state.isProcessing}
                              className="text-xs text-slate-600 hover:text-red-400 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Eraser className="w-3 h-3" /> Clear
                            </button>
                            <button 
                              onClick={handleReset} 
                              disabled={state.isProcessing}
                              className="text-xs text-slate-600 hover:text-slate-400 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RotateCcw className="w-3 h-3" /> Reset Defaults
                            </button>
                        </div>
                    </label>
                    <div className="relative">
                        <CodeEditor 
                            key={editorKey}
                            value={inputText}
                            onChange={setInputText}
                            disabled={state.isProcessing}
                            language={language}
                        />
                        {state.isProcessing && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur rounded-full border border-magma-500/30 text-xs font-mono text-magma-400 shadow-xl pointer-events-none z-40 animate-in fade-in duration-300">
                               <Loader2 className="w-3 h-3 animate-spin" />
                               <span>ANALYZING SYNTAX...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="space-y-6 bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                    
                    {/* Cycles Control */}
                    <div>
                        <label className="text-sm font-semibold text-slate-400 mb-2 flex items-center">
                            Mutation Cycles: <span className="text-white ml-2">{cycles}</span>
                            {state.isProcessing && <Loader2 className="w-3 h-3 animate-spin text-slate-600 ml-auto" />}
                        </label>
                        <input 
                            type="range" 
                            min="1" 
                            max="100" 
                            step="1"
                            value={cycles}
                            onChange={(e) => setCycles(parseInt(e.target.value))}
                            disabled={state.isProcessing}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-magma-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="flex justify-between text-xs text-slate-600 font-mono mt-1">
                            <span>1</span>
                            <span>100</span>
                        </div>
                    </div>

                    {/* Heat Temp Control */}
                    <div>
                        <label className="text-sm font-semibold text-magma-400 mb-2 flex items-center gap-2">
                            <ThermometerSun className="w-4 h-4" />
                            Entropy (Heat): <span className="text-white">{heatTemp}</span>
                        </label>
                        <input 
                            type="range" 
                            min="0.1" 
                            max="1.7" 
                            step="0.1"
                            value={heatTemp}
                            onChange={(e) => setHeatTemp(parseFloat(e.target.value))}
                            disabled={state.isProcessing}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-magma-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="text-xs text-slate-500 mt-1">
                            Higher values increase hallucination & weirdness.
                        </div>
                    </div>

                    {/* Cool Temp Control */}
                    <div>
                        <label className="text-sm font-semibold text-frost-400 mb-2 flex items-center gap-2">
                            <ThermometerSnowflake className="w-4 h-4" />
                            Stabilization (Cool): <span className="text-white">{coolTemp}</span>
                        </label>
                        <input 
                            type="range" 
                            min="0.1" 
                            max="1.0" 
                            step="0.1"
                            value={coolTemp}
                            onChange={(e) => setCoolTemp(parseFloat(e.target.value))}
                            disabled={state.isProcessing}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-frost-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="text-xs text-slate-500 mt-1">
                            Lower values increase adherence to logic.
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex gap-3">
                        {!state.isProcessing ? (
                            <button 
                                onClick={handleStart}
                                disabled={!inputText.trim()}
                                className="flex-1 bg-gradient-to-r from-magma-600 to-magma-500 hover:from-magma-500 hover:to-magma-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-magma-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                IGNITE ENGINE
                            </button>
                        ) : (
                            <button 
                                onClick={handleStop}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors border border-slate-600"
                            >
                                <Square className="w-4 h-4 fill-current" />
                                STOP
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Visualization Section */}
            <ProcessVisualizer 
                phase={state.phase} 
                heatText={currentHeatText}
                coolText={currentCoolText}
            />

            {/* History / Output Section */}
            {state.currentState && !state.isProcessing && (
                <div className="mt-12 bg-slate-800/20 border border-slate-700 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex items-center justify-between">
                        <h3 className="font-bold text-slate-200 flex items-center gap-2">
                            <FlaskConical className="w-5 h-5 text-frost-400" />
                            Final Transmutation
                        </h3>
                        <button 
                            onClick={handleCopyResult}
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition-colors"
                        >
                            <Copy className="w-3 h-3" /> Copy Code
                        </button>
                    </div>
                    <div className="p-0">
                        <pre className="p-6 overflow-x-auto text-sm font-mono text-emerald-100 bg-[#0a0f1e] custom-scrollbar">
                            <code>{state.currentState}</code>
                        </pre>
                    </div>
                </div>
            )}
            
            {/* Autogram Report - Conditional */}
            {state.currentState && !state.isProcessing && isAutogramTask && (
               <AutogramReport output={state.currentState} />
            )}

            {/* History Log */}
            <HistoryLog history={state.history} language={language} />
           </>
        )}
        
        {/* Info Footer */}
        <div className="mt-16 pt-8 border-t border-slate-800 text-center text-slate-600 text-sm flex items-center justify-center gap-2">
            <Info className="w-4 h-4" />
            <span>The engine hallucinates logic to find new patterns. Always verify output.</span>
        </div>

      </main>
    </div>
  );
};

export default App;
