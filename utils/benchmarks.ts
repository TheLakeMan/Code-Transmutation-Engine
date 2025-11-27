
import { Language } from '../types';

export interface Benchmark {
  name: string;
  lang: Language;
  code: string;
}

export const BENCHMARKS: Benchmark[] = [
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
    },
    {
        name: "Autogram Challenge",
        lang: 'markdown',
        code: `You are the world's greatest explorer of self-descriptive English sentences.

Rules (strict, no exceptions):
- Input string contains only lowercase a-z and spaces
- It must contain phrases like "one a", "two b", "three c", ..., "ten z" (English number words)
- Every letter that appears anywhere in the string (including inside the number words) must be exactly counted by those phrases
- Every letter mentioned in the phrases must appear exactly that many times
- Order of phrases doesn't matter
- You may only use the number words: one, two, three, four, five, six, seven, eight, nine, ten

Known valid sentences (do not simply repeat these):
1. four a two e one f one h one i one n one o two r one s two t one u
2. five a one d one f three e one h one i one m one n three o three r one s three t two v one y
3. zero b zero c zero d zero f zero g zero h zero i zero j zero k zero l zero m zero p zero q zero s

Your task:
Generate a NEW, valid self-descriptive sentence (Autogram).
`
    },
    {
        name: "Quine Generator (Python)",
        lang: 'python',
        code: `# A Quine is a non-empty computer program which takes no input and produces a copy of its own source code as its only output.

def generate_quine():
    # Write a python script that prints its own source code exactly.
    # Do not use file I/O.
    # Use the format string technique or similar.
    pass
`
    }
];
