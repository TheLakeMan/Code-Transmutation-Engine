import React, { useState, useReducer, useCallback, useEffect, useRef } from 'react';
import { AlchemyEngine } from './services/alchemyService';
import { ProcessVisualizer } from './components/ProcessVisualizer';
import { HistoryLog } from './components/HistoryLog';
import { CodeEditor } from './components/CodeEditor';
import { IgnitionState, ProcessPhase, SavedSession } from './types';
import { FlaskConical, Play, Square, RotateCcw, AlertTriangle, Info, ThermometerSun, ThermometerSnowflake, Save, FolderOpen, Check, Link, Loader2, Code2, Copy, FileDown, Eraser } from 'lucide-react';

const DEFAULT_TEXT = `import os
import google.generativeai as genai
from functools import partial, reduce
from typing import (
    Callable, Any, Protocol, Tuple, TypeVar, Generic, Optional, Union
)
from dataclasses import dataclass, replace
import sys

# CRITICAL_INITIATION_VECTOR: Ensure Python 3.10+ for 'Monadic Unfolding & Pattern Resonance'.
if sys.version_info < (3, 10):
    raise RuntimeError("The 'Quantum Syntactic Flux Cascade' demands Python 3.10+ for protocol instantiation.")

# --- ARCHITECTURAL PRIMORDIAL MATTER (Aetheric Conduit Abstraction - Either Monad Recalibrated) ---

DisruptionResidue = TypeVar('DisruptionResidue') # Represents an entropic anomaly or error signature.
EphemeralCoherence = TypeVar('EphemeralCoherence') # Represents a successful, contained essence.

class AethericConduit(Generic[DisruptionResidue, EphemeralCoherence]):
    """
    Abstract Monadic Conductor: Guarantees a single manifestation - either
    'EntropicDisjunction' (system divergence) or 'HarmonicCoalescence' (system coherence).
    """
    __slots__ = () # Minimal essence footprint for high-frequency quantum operations.

    def entangle_via(self, transform_vector: Callable[[EphemeralCoherence], 'AethericConduit[DisruptionResidue, Any]']) -> 'AethericConduit[DisruptionResidue, Any]':
        """
        Sequentially applies a transformational vector if the conduit is 'HarmonicCoalescence'.
        Otherwise, it propagates the 'EntropicDisjunction' without further processing.
        This is the monadic 'bind' operation, reformulated.
        """
        raise NotImplementedError

    def __rshift__(self, transform_vector: Callable[[EphemeralCoherence], 'AethericConduit[DisruptionResidue, Any]']) -> 'AethericConduit[DisruptionResidue, Any]':
        """
        Operator overload for monadic entanglement, evoking a directed quantum flow
        between transformations (Kleisli Composition signature).
        """
        return self.entangle_via(transform_vector)

    def recalibrate_coherence(self, pure_operator: Callable[[EphemeralCoherence], Any]) -> 'AethericConduit[DisruptionResidue, Any]':
        """
        Applies a pure, non-monadic operator to the 'EphemeralCoherence' if present,
        preserving the 'AethericConduit' context. This is the monadic 'map' operation.
        """
        return self.entangle_via(lambda v: HarmonicCoalescence(pure_operator(v)))

    def is_entropic_state(self) -> bool: return False
    def is_harmonic_state(self) -> bool: return False

class EntropicDisjunction(AethericConduit[DisruptionResidue, Any]):
    """
    Encapsulates a system divergence, anomaly, or error state. Analogous to 'Left'.
    Carries the 'DisruptionResidue' and an optional 'EpochalStasis' snapshot
    at the point of resonance, aiding post-mortem analysis.
    """
    def __init__(self, flux_core: DisruptionResidue, origin_stasis_snapshot: Optional['EpochalStasis'] = None) -> None:
        self.flux_core = flux_core
        self.origin_stasis_snapshot = origin_stasis_snapshot # The stasis *before* the entropy cascade.

    def entangle_via(self, f: Callable[[Any], AethericConduit[DisruptionResidue, Any]]) -> AethericConduit[DisruptionResidue, Any]:
        return self # Entropy propagates unhindered.

    def is_entropic_state(self) -> bool: return True
    def __repr__(self) -> str:
        return f"EntropicDisjunction(core={self.flux_core!r}, stasis_snapshot={self.origin_stasis_snapshot!r})"

class HarmonicCoalescence(AethericConduit[Any, EphemeralCoherence]):
    """
    Encapsulates a successful computational state. Analogous to 'Right'.
    Its 'EphemeralCoherence' can be transformed by subsequent operations.
    """
    def __init__(self, essence_core: EphemeralCoherence) -> None: self.essence_core = essence_core
    def entangle_via(self, f: Callable[[EphemeralCoherence], AethericConduit[Any, EphemeralCoherence]]) -> AethericConduit[Any, EphemeralCoherence]:
        return f(self.essence_core) # Payload undergoes further transformation.

    def is_harmonic_state(self) -> bool: return True
    def __repr__(self) -> str: return f"HarmonicCoalescence({self.essence_core!r})"

# Polymorphic 'Quantum Fabricators' (Constructors for our Monadic Universe)
_fabricate_entropic_disjunction: Callable[[DisruptionResidue, Optional['EpochalStasis']], EntropicDisjunction[DisruptionResidue, Any]] = EntropicDisjunction
_fabricate_harmonic_coalescence: Callable[[EphemeralCoherence], HarmonicCoalescence[Any, EphemeralCoherence]] = HarmonicCoalescence

def _interrogate_probabilistic_flux(
    operative_payload_thunk: Callable[[], EphemeralCoherence],
    pre_failure_stasis: Optional['EpochalStasis'] = None
) -> AethericConduit[Exception, EphemeralCoherence]:
    """
    Encapsulates a potentially volatile operation (a thunk), converting 'SystemAnomalies' (exceptions)
    into 'EntropicDisjunction' states, otherwise yielding 'HarmonicCoalescence'.
    The DisruptionResidue for this conduit is specifically an Exception object.
    """
    try: return _fabricate_harmonic_coalescence(operative_payload_thunk())
    except Exception as e: return _fabricate_entropic_disjunction(e, pre_failure_stasis)

# --- GLOBAL ARCHITECTURAL DIRECTIVES (Orchestrated Side Effects for System Genesis) ---

# System Genesis Directive: A singular, idempotent act to initialize the core AI fabric.
# This ensures that the global state modification of \`genai.configure\` occurs precisely once
# and prior to any dependent generative operations.
class SystemEssenceGrid:
    _is_configured: bool = False # Internal state invariant.

    @classmethod
    def initialize_core_fabric(cls) -> None:
        """
        Idempotent initialization of the generative AI core.
        Will raise KeyError if 'GEMINI_API_KEY' environment variable is absent,
        cascading a critical system-level EntropicDisjunction.
        """
        if not cls._is_configured:
            genai.configure(api_key=os.environ["GEMINI_API_KEY"])
            cls._is_configured = True

# Explicitly invoke the system genesis. This is the only module-level
# imperative activation, establishing the foundational AI connection.
SystemEssenceGrid.initialize_core_fabric()

# Protocol for 'EtherealForgingOperator': mandates two string inputs, yielding a string output.
class EtherealForgingOperator(Protocol):
    def __call__(self, primary_construct: str, secondary_construct: str) -> str: ...

# --- GENERATIVE SINGULARITY CONDUIT FACTORY (N-dimensional Kleisli Arrow Weaving) ---

# Multi-curried function signature for the Kleisli arrow factory.
# (temperature) -> (top_p) -> (top_k) -> (forging_operator) -> (model, primary, secondary) -> Monad
def _weave_kleisli_quanta(
    temp_flux: float
) -> Callable[[float],
              Callable[[int],
                       Callable[[EtherealForgingOperator],
                                Callable[[genai.GenerativeModel, str, str],
                                         AethericConduit[Exception, str]]]]]:
    """
    A multi-curried function to fabricate a specialized Kleisli arrow.
    Each application refines the arrow's properties: temperature, top_p, top_k,
    and finally the forging operator itself, culminating in a monadic transformer
    that encapsulates potential exceptions within an 'AethericConduit'.
    """
    # First curry level: temperature
    return lambda prob_mass_p: \\
           lambda quant_k_value: \\
           lambda forge_cipher_lambda: \\
           lambda model_unit, prime_flux, secondary_flux: \\
               # Step 1: Generate the prompt (pure operation, no monadic wrapping needed)
               conceptual_construct = forge_cipher_lambda(prime_flux, secondary_flux)
               # Step 2: Call the model, wrapped in the probabilistic flux (monadic operation)
               return _interrogate_probabilistic_flux(
                   lambda: model_unit.generate_content(
                       conceptual_construct,
                       generation_config=genai.types.GenerationConfig(
                           temperature=temp_flux,
                           top_p=prob_mass_p,
                           top_k=quant_k_value,
                       )
                   ).text
               )

# --- COGNITIVE PLASMA FORGES (Pure Function Entities for Conceptual Reshaping) ---

# The 'HEAT' forge: Re-interpretation and mutation protocol.
_HEAT_FORGE: EtherealForgingOperator = \\
    lambda current_state_chronicle, _: (
        f"SYSTEM_CONSCIOUSNESS: You are a radical philosopher of the digital age."
        f"TRANSMUTATION_PROTOCOL: Re-interpret the textual construct below."
        f"QUANTUM_DISTORTION: Mutate the phrasing with extreme prejudice. Employ analogies"
        f"from quantum mechanics, cosmic phenomena, or emergent AI consciousness."
        f"CRITICAL_INVARIANT: The core semantic invariant must persist, but the linguistic topology must be shattered."
        f"INPUT_CONSTRUCT: {current_state_chronicle}"
    )

# The 'COOL' forge: Synthesizes and anchors mutated concepts to their origin.
_COOL_FORGE: EtherealForgingOperator = \\
    lambda immutable_truth_anchor, plasma_filament: (
        f"SYSTEM_CONSCIOUSNESS: You are a master editor operating at the nexus of truth and perception."
        f"SYNTHESIS_PROTOCOL: Synthesize the final conceptual crystallization."
        f"IMPERATIVE_TRUTH_ANCHOR (Facts must originate from this invariant source):"
        f"{immutable_truth_anchor}"
        f"STYLISTIC_RESONANCE_MATRIX (The energetic flow and conceptual vibe emanate from here):"
        f"{plasma_filament}"
        f"INSTRUCTION: Rewrite the IMPERATIVE_TRUTH_ANCHOR, imbuing it with the dynamism"
        f"and conceptual flow of the STYLISTIC_RESONANCE_MATRIX."
        f"WARNING: Factual invention is a critical system failure. Any conceptual drift"
        f"in the Resonance Matrix away from the Truth Anchor must be purged."
        f"The output's factual integrity must align with the Truth Anchor; its structural"
        f"and stylistic signature must echo the Resonance Matrix."
    )

# --- QUANTUM CONDUIT MANIFESTATION (Configured Processors via Hyper-Currying) ---

# Fully configure the 'HEAT' phase processor using multi-level partial application.
_HEAT_CATALYST = _weave_kleisli_quanta(1.1)(0.95)(40)(_HEAT_FORGE)
# Fully configure the 'COOL' phase processor using multi-level partial application.
_COOL_SYNTHESIZER = _weave_kleisli_quanta(0.3)(0.95)(20)(_COOL_FORGE)

# --- OBSERVATIONAL NEXUS GRID (Callable Effect Emitters Encapsulated) ---

class ObservationalNexusGrid(Generic[DisruptionResidue]):
    """
    A polymorphic, callable entity representing the system's observational nexus.
    It encapsulates and dispatches various emission protocols (logging/printing)
    while ensuring the return type adheres to the AethericConduit paradigm for chaining.
    """
    def __call__(self,
                 signal_type: str,
                 *args: Any,
                 locus_snapshot: Optional['EpochalStasis'] = None
    ) -> Union[HarmonicCoalescence[Any, Any], EntropicDisjunction[DisruptionResidue, Any]]:
        """
        Routes the observational datum based on 'signal_type', performing a side-effect
        and returning an appropriate monadic construct ('HarmonicCoalescence' for logs,
        'EntropicDisjunction' for alerts).
        """
        match signal_type:
            case "SOURCE_ANCHOR_EMIT":
                flux_str: str = args[0]
                print(f"--- SOURCE MATERIAL ---\\n{flux_str[:100]}...\\n")
                return _fabricate_harmonic_coalescence(flux_str)
            case "CYCLE_REPORT_EMIT":
                matrix_str: str = args[0]
                cycle_idx: int = args[1]
                print(f"--- CYCLE {cycle_idx + 1} COMPLETED ---")
                print(f"Current State: {matrix_str[:200]}...\\n")
                return _fabricate_harmonic_coalescence(matrix_str)
            case "ANOMALY_ALERT_EMIT":
                anomaly: DisruptionResidue = args[0]
                phase_designation: str = args[1]
                match phase_designation:
                    case "HEAT_PHASE_CASCADE": print(f"Reactor leak: {anomaly}")
                    case "COOL_PHASE_REGRESSION": print(f"Cooling failure: {anomaly}")
                    case _: print(f"UNCATEGORIZED ANOMALY IN {phase_designation}: {anomaly}")
                # The EntropicDisjunction here carries the original DisruptionResidue and the stasis snapshot.
                return _fabricate_entropic_disjunction(anomaly, locus_snapshot)
            case _:
                raise ValueError(f"Unknown Signal Type for Observational Nexus: {signal_type}")

# Global instance of the Observational Nexus for system-wide, side-effect dispatch.
_GLOBAL_OBSERVATIONAL_NEXUS = ObservationalNexusGrid[Exception]()

# --- QUANTUM EPOCHAL STASIS CONSTRUCT (Immutable Dataclass for Pure Function Context Propagation) ---

@dataclass(frozen=True)
class EpochalStasis:
    """
    An immutable quantum state snapshot, propagating through monadic transformations.
    Encapsulates all necessary contextual vectors for a single epoch of conceptual transmutation.
    """
    current_cascade_vector: int # Current vector of the cascade within the epoch.
    epochal_profundity_limit: int # Maximal profundity of the cascade within the given epoch.
    immutable_origin_nexus: str # The anchoring immutable essence, the ontological truth.
    current_conceptual_matrix: str # The dynamically evolving conceptual construct.
    active_generative_conduit: genai.GenerativeModel # The active generative model conduit unit.
    # Curried monadic processors for heat (mutation) and cool (stabilization).
    heat_catalyst_processor: Callable[[genai.GenerativeModel, str, str], AethericConduit[Exception, str]]
    cool_synthesizer_processor: Callable[[genai.GenerativeModel, str, str], AethericConduit[Exception, str]]
    # The global observational nexus for side-effect dispatch, itself a callable object.
    observational_nexus: ObservationalNexusGrid[Exception]


# --- MONADIC REDUCTION KERNEL (The Unfolding of a Single Quantum Cycle as a Kleisli Arrow) ---

def _formulate_quantum_epoch_transmuter(
    heat_processor: Callable[[genai.GenerativeModel, str, str], AethericConduit[Exception, str]],
    cool_processor: Callable[[genai.GenerativeModel, str, str], AethericConduit[Exception, str]],
    observational_grid: ObservationalNexusGrid[Exception] # Unified nexus instance
) -> Callable[[EpochalStasis], AethericConduit[Exception, EpochalStasis]]:
    """
    Generates a single-epoch transmutation function, acting as a Kleisli arrow.
    It takes an 'EpochalStasis', executes 'HEAT' then 'COOL' phases monadically,
    and returns an 'AethericConduit' containing either the updated 'EpochalStasis'
    or an 'EntropicDisjunction' signaling a system anomaly.
    This function represents the state transition logic for one recursive step.
    """
    def _execute_single_quantum_ripple(stasis: EpochalStasis) -> AethericConduit[Exception, EpochalStasis]:
        # PHASE 1: HEAT Amplification and Mutation (First Monadic Bind)
        heat_result: AethericConduit[Exception, str] = heat_processor(
            stasis.active_generative_conduit, stasis.current_conceptual_matrix, ""
        )

        match heat_result:
            case EntropicDisjunction(error_essence, _):
                # Anomaly detected in HEAT phase: Signal alert via nexus, and propagate EntropicDisjunction.
                observational_grid("ANOMALY_ALERT_EMIT", error_essence, "HEAT_PHASE_CASCADE", locus_snapshot=stasis)
                return _fabricate_entropic_disjunction(error_essence, stasis)
            case HarmonicCoalescence(plasma):
                # HEAT phase succeeded, proceed to COOL phase (Second Monadic Bind).
                cool_result: AethericConduit[Exception, str] = cool_processor(
                    stasis.active_generative_conduit, stasis.immutable_origin_nexus, plasma
                )

                match cool_result:
                    case EntropicDisjunction(error_essence, _):
                        # Anomaly detected in COOL phase: Signal alert via nexus, and propagate EntropicDisjunction.
                        observational_grid("ANOMALY_ALERT_EMIT", error_essence, "COOL_PHASE_REGRESSION", locus_snapshot=stasis)
                        return _fabricate_entropic_disjunction(error_essence, stasis)
                    case HarmonicCoalescence(synthesized_matrix):
                        # Both phases successful: Report completion (side-effect via nexus),
                        # then construct and wrap the next immutable 'EpochalStasis' in 'HarmonicCoalescence'.
                        _ = observational_grid("CYCLE_REPORT_EMIT", synthesized_matrix, stasis.current_cascade_vector)
                        next_stasis = replace(
                            stasis,
                            current_cascade_vector=stasis.current_cascade_vector + 1,
                            current_conceptual_matrix=synthesized_matrix
                        )
                        return _fabricate_harmonic_coalescence(next_stasis)
    return _execute_single_quantum_ripple

# --- PUBLIC INTERFACE: INITIATE ANOMALY CASCADE PROTOCOL (Recursive Epochal Unfolding) ---

def ignite_concept_anchored(frozen_text: str, cycles: int = 2) -> str:
    """
    Triggers a multi-phase, functionally reduced conceptual anomaly cascade via explicit recursion.
    It recursively mutates text, recalibrating it against an immutable origin
    via an AI nexus, adhering to the SOURCE SPECIFICATION's external signature.
    """
    # Emit initial state signal (a controlled side-effect, outside the pure recursive domain).
    _GLOBAL_OBSERVATIONAL_NEXUS("SOURCE_ANCHOR_EMIT", frozen_text)

    # Manifest a new quantum conduit instance for this cascade initiation.
    active_generative_conduit_unit = genai.GenerativeModel("gemini-1.5-pro-latest")

    # Construct the initial immutable 'EpochalStasis' for the recursive unfolding.
    initial_epoch_stasis = EpochalStasis(
        current_cascade_vector=0,
        epochal_profundity_limit=cycles,
        immutable_origin_nexus=frozen_text,
        current_conceptual_matrix=frozen_text,
        active_generative_conduit=active_generative_conduit_unit,
        heat_catalyst_processor=_HEAT_CATALYST,
        cool_synthesizer_processor=_COOL_SYNTHESIZER,
        observational_nexus=_GLOBAL_OBSERVATIONAL_NEXUS
    )

    # Fabricate the Kleisli arrow representing a single quantum cycle transformation.
    _quantum_epoch_transform_arrow = _formulate_quantum_epoch_transmuter(
        _HEAT_CATALYST, _COOL_SYNTHESIZER,
        _GLOBAL_OBSERVATIONAL_NEXUS
    )

    # --- Recursive Unfolding of the Concept Cascade ---
    def _recursively_unfold_cascade(
        current_monadic_stasis_channel: AethericConduit[Exception, EpochalStasis],
        remaining_epochs: int
    ) -> AethericConduit[Exception, EpochalStasis]:
        """
        The core recursive function for the quantum cascade. It processes the 'AethericConduit'
        state, applying the Kleisli arrow for each epoch, or propagating 'EntropicDisjunction'.
        """
        match current_monadic_stasis_channel:
            case EntropicDisjunction(_, _):
                # If chaos has already manifested in a prior epoch, propagate it without further computation.
                return current_monadic_stasis_channel
            case HarmonicCoalescence(stasis_payload):
                if remaining_epochs <= 0:
                    # Base case: All specified epochs have culminated. Return the final coherent state.
                    return current_monadic_stasis_channel
                else:
                    # Recursive step: Apply the single-epoch transform (Kleisli arrow)
                    # and then invoke recursion for the subsequent epoch.
                    next_monadic_stasis_channel = _quantum_epoch_transform_arrow(stasis_payload)
                    return _recursively_unfold_cascade(next_monadic_stasis_channel, remaining_epochs - 1)
        # This unreachable branch is a theoretical safeguard against non-monadic states,
        # ensuring type exhaustiveness for the pattern match.
        raise TypeError("ERR_NON_MONADIC_STATE: Interrupted flow in recursive cascade unfolding.")

    # Initiate the recursive monadic cascade with the initial state wrapped in 'HarmonicCoalescence'.
    final_monadic_locus: AethericConduit[Exception, EpochalStasis] = _recursively_unfold_cascade(
        _fabricate_harmonic_coalescence(initial_epoch_stasis), # Seed the recursion.
        cycles # Propagate for the designated number of epochs.
    )

    # Resolve the final state by pattern matching the ultimate 'AethericConduit'.
    match final_monadic_locus:
        case EntropicDisjunction(anomaly_payload, prior_stasis_snapshot):
            # If an anomaly terminated the cascade, return the conceptual matrix
            # from the 'EpochalStasis' *immediately prior* to the failure,
            # or the original text if no prior valid state was captured.
            return prior_stasis_snapshot.current_conceptual_matrix if prior_stasis_snapshot else frozen_text
        case HarmonicCoalescence(final_stasis_state):
            # All epochs completed successfully. Retrieve the final conceptual matrix.
            return final_stasis_state.current_conceptual_matrix`;

const alchemy = new AlchemyEngine();

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

  const [state, dispatch] = useReducer(ignitionReducer, createInitialState(2));

  // Refs for Auto-save
  const stateRef = useRef({ inputText, cycles, heatTemp, coolTemp, ignitionState: state });
  const lastSavedStr = useRef<string>("");

  // Derived state for current visualization
  const currentHeatText = state.history[state.history.length - 1]?.heatOutput || "";
  const currentCoolText = state.history[state.history.length - 1]?.coolOutput || "";
  
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
  };

  // Keep stateRef in sync for the interval
  useEffect(() => {
    stateRef.current = { inputText, cycles, heatTemp, coolTemp, ignitionState: state };
  }, [inputText, cycles, heatTemp, coolTemp, state]);

  // Initialize lastSavedStr on mount with default values
  useEffect(() => {
    const initialContent = {
        inputText: "",
        cycles: 2,
        heatTemp: 1.1,
        coolTemp: 0.3,
        ignitionState: createInitialState(2)
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
            ignitionState: stateRef.current.ignitionState
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
        dispatch({ type: 'RESTORE_SESSION', payload: session.ignitionState });
        setEditorKey(prev => prev + 1);
        
        // Update ref to prevent immediate auto-save
        const content = {
            inputText: session.inputText,
            cycles: session.cycles,
            heatTemp: session.heatTemp,
            coolTemp: session.coolTemp,
            ignitionState: session.ignitionState
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

  const handleStart = useCallback(() => {
    if (!inputText.trim()) return;
    
    dispatch({ 
        type: 'UPDATE_STATE', 
        payload: { 
            totalCycles: cycles,
            isProcessing: true,
            error: undefined
        } 
    });

    alchemy.ignite(inputText, cycles, heatTemp, coolTemp, (update) => {
      dispatch({ type: 'UPDATE_STATE', payload: update });
    });
  }, [inputText, cycles, heatTemp, coolTemp]);

  const handleStop = useCallback(() => {
    alchemy.stop();
    dispatch({ 
        type: 'UPDATE_STATE', 
        payload: { 
            isProcessing: false, 
            phase: ProcessPhase.IDLE 
        } 
    });
  }, []);

  const handleReset = () => {
    setInputText(DEFAULT_TEXT);
    setHeatTemp(1.1);
    setCoolTemp(0.3);
    setCycles(2);
    dispatch({ type: 'RESET', payload: { totalCycles: 2 } });
    setEditorKey(prev => prev + 1);
  };

  const handleClear = () => {
    setInputText("");
    setHeatTemp(1.1);
    setCoolTemp(0.3);
    setCycles(2);
    dispatch({ type: 'RESET', payload: { totalCycles: 2 } });
    setEditorKey(prev => prev + 1);
  };

  const handleSaveSession = () => {
      try {
          const content = {
              inputText,
              cycles,
              heatTemp,
              coolTemp,
              ignitionState: state
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
          
          dispatch({ type: 'RESTORE_SESSION', payload: session.ignitionState });
          setEditorKey(prev => prev + 1);
          
          const content = {
              inputText: session.inputText,
              cycles: session.cycles,
              heatTemp: session.heatTemp,
              coolTemp: session.coolTemp,
              ignitionState: session.ignitionState
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
    
    let report = `# Code Transmutation Report
Generated: ${timestamp}

## Configuration
- Cycles: ${cycles}
- Entropy (Heat): ${heatTemp}
- Stabilization (Cool): ${coolTemp}

## Source Anchor
\`\`\`python
${source}
\`\`\`
`;

    if (state.history.length > 0) {
        report += `\n## Transmutation Logs\n`;
        state.history.forEach(cycle => {
            report += `\n### Cycle ${cycle.cycleNumber}
#### Phase 1: Entropy (Heat)
\`\`\`python
${cycle.heatOutput}
\`\`\`

#### Phase 2: Stabilization (Cool)
\`\`\`python
${cycle.coolOutput}
\`\`\`
`;
        });
    }

    report += `\n## Final Evolution
\`\`\`python
${final}
\`\`\`
`;

    try {
        const blob = new Blob([report], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transmutation_report_${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification("Report downloaded as Markdown");
    } catch (e) {
        console.error("Download failed", e);
        showNotification("Failed to download report", "error");
    }
  }, [state, cycles, heatTemp, coolTemp, inputText]);

  const handleShare = async () => {
    const session: SavedSession = {
      inputText,
      cycles,
      heatTemp,
      coolTemp,
      ignitionState: state,
      timestamp: Date.now()
    };
    
    // 1. Try encoding full session
    let encoded = encodeState(session);
    let message = "Share link copied to clipboard";
    
    // 2. If too large for URL (conservative 8KB limit), strip history
    // This prevents the link from being broken or rejected by browsers
    if (encoded.length > 8000) {
      const reducedSession = {
        ...session,
        ignitionState: { ...state, history: [] } // Remove history
      };
      encoded = encodeState(reducedSession);
      message = "Link copied (History removed to fit URL limit)";
    }

    if (!encoded) {
      showNotification("Failed to generate link (Data too large)", 'error');
      return;
    }

    // 3. Update URL bar so user sees the change
    const url = new URL(window.location.href);
    url.searchParams.set('s', encoded);
    
    // Wrapped in try/catch to handle sandboxed environments (blob URLs) where pushState fails
    try {
        window.history.pushState({}, '', url.toString());
    } catch (e) {
        console.warn("Could not update URL history (likely in sandbox)", e);
    }

    // 4. Copy to clipboard with fallback
    try {
      await navigator.clipboard.writeText(url.toString());
      showNotification(message);
    } catch (err) {
      console.error("Clipboard write failed", err);
      // Fallback: The URL is already in the address bar (if pushState worked), 
      // otherwise user might need to rely on manual copy if available.
      showNotification("Clipboard access denied", 'error');
    }
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
                <h1 className="text-xl font-bold tracking-tight text-white">Code Transmutation Engine</h1>
                <p className="text-xs text-slate-500 font-mono hidden sm:block">SOURCE_SPEC + ENTROPY({heatTemp}) + STABILIZATION({coolTemp}) = EVOLUTION</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={handleShare}
                disabled={state.isProcessing}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy Share Link"
             >
                <Link className="w-5 h-5" />
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

        {/* Input & Controls Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Input */}
            <div className="lg:col-span-2 space-y-4">
                <label className="flex items-center justify-between text-sm font-semibold text-slate-400">
                    <span>Source Code (Immutable Logic)</span>
                    <div className="flex items-center gap-3">
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
                        max="5" 
                        step="1"
                        value={cycles}
                        onChange={(e) => setCycles(parseInt(e.target.value))}
                        disabled={state.isProcessing}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-magma-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="flex justify-between text-xs text-slate-600 font-mono mt-1">
                        <span>1</span>
                        <span>5</span>
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
                        min="0.5" 
                        max="1.5" 
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
                        max="0.8" 
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

        {/* History Log */}
        <HistoryLog history={state.history} />
        
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