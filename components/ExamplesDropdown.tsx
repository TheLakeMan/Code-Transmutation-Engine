
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import { Language } from '../types';

const EXAMPLES = [
    {
        name: "Quantum Flux (Python)",
        lang: 'python',
        code: `import os
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

DisruptionResidue = TypeVar('DisruptionResidue')
EphemeralCoherence = TypeVar('EphemeralCoherence')

class AethericConduit(Generic[DisruptionResidue, EphemeralCoherence]):
    """
    Abstract Monadic Conductor: Guarantees a single manifestation - either
    'EntropicDisjunction' (system divergence) or 'HarmonicCoalescence' (system coherence).
    """
    __slots__ = () 

    def entangle_via(self, transform_vector: Callable[[EphemeralCoherence], 'AethericConduit[DisruptionResidue, Any]']) -> 'AethericConduit[DisruptionResidue, Any]':
        raise NotImplementedError
`
    },
    {
        name: "Pointer Alchemy (C)",
        lang: 'c',
        code: `#include <stdio.h>
#include <stdlib.h>

// THE_VOID: A memory region where pointers go to die
#define THE_VOID NULL

typedef struct {
    int flux_value;
    char *essence_signature;
} PhilosophersStone;

void transmutation(PhilosophersStone **substance) {
    if (*substance == THE_VOID) {
        printf("Error: Cannot transmute the void.\\n");
        return;
    }
    
    // Unsafe pointer arithmetic as a metaphor for chaos
    (*substance)->flux_value ^= 0xFFFFFFFF; 
    printf("Transmutation complete. Flux inverted.\\n");
}

int main() {
    PhilosophersStone *lead = malloc(sizeof(PhilosophersStone));
    lead->flux_value = 42;
    lead->essence_signature = "Heavy";
    
    transmutation(&lead);
    
    free(lead);
    return 0;
}
`
    },
    {
        name: "Neural Lace (TypeScript)",
        lang: 'typescript',
        code: `interface SynapticNode {
    id: string;
    activationPotential: number;
    connections: SynapticNode[];
}

type ConsciousnessStream = Promise<SynapticNode>;

const igniteSynapse = async (input: SynapticNode): ConsciousnessStream => {
    // Simulate neural delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (input.activationPotential > 0.9) {
        console.log("CRITICAL THRESHOLD REACHED: Singularity Imminent");
        return { ...input, activationPotential: 1.0 };
    }
    
    return { 
        ...input, 
        activationPotential: Math.min(1.0, input.activationPotential * 1.5) 
    };
};
`
    }
];

interface ExamplesDropdownProps {
  onSelect: (text: string, lang: Language) => void;
  disabled?: boolean;
}

export const ExamplesDropdown: React.FC<ExamplesDropdownProps> = ({ onSelect, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (code: string, lang: string) => {
      onSelect(code, lang as Language);
      setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="inline-flex justify-center w-full rounded-md border border-slate-700 shadow-sm px-3 py-1.5 bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-magma-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors items-center gap-2"
        >
          <BookOpen className="w-3 h-3" />
          Load Example
          <ChevronDown className="w-3 h-3 -mr-1" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-[100] border border-slate-700">
            <div className="py-1" role="menu" aria-orientation="vertical">
                {EXAMPLES.map((ex, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSelect(ex.code, ex.lang)}
                        className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-between group"
                        role="menuitem"
                    >
                        <span>{ex.name}</span>
                        <span className="text-[10px] bg-slate-900 text-slate-500 px-1 rounded group-hover:bg-slate-600 group-hover:text-slate-200">{ex.lang}</span>
                    </button>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};
