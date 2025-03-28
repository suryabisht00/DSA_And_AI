"use client";

import { useState, useEffect } from 'react';
import { AlgorithmCard } from '@/components/algorithm-card';
import { Brain, GitCompare, GitMerge, Network, Split, Calculator, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const algorithms = [
    {
      title: 'Bubble Sort',
      description: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
      icon: GitCompare,
      href: '/algorithms/bubble-sort',
      complexity: 'O(n²)',
      category: 'Sorting'
    },
    {
      title: 'Merge Sort',
      description: 'An efficient, stable sorting algorithm that uses divide and conquer strategy to sort elements by splitting, sorting, and merging subarrays.',
      icon: Split,
      href: '/algorithms/merge-sort',
      complexity: 'O(n log n)',
      category: 'Sorting'
    },
    {
      title: "Kadane's Algorithm",
      description: 'An efficient algorithm for finding the maximum subarray sum in a one-dimensional array, useful for optimization problems.',
      icon: Calculator,
      href: '/algorithms/kadane',
      complexity: 'O(n)',
      category: 'Dynamic Programming'
    },
    {
      title: 'Binary Search',
      description: 'A fast search algorithm that finds the position of a target value within a sorted array by repeatedly dividing the search space in half.',
      icon: Search,
      href: '/algorithms/binary-search',
      complexity: 'O(log n)',
      category: 'Searching'
    }
  ];

  const categories = Array.from(new Set(algorithms.map(algo => algo.category)));

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50 mb-4">
            DSA Visualizer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Interactive visualizations of common data structures and algorithms.
            Learn through animation and hands-on experimentation.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {categories.map((category) => (
              <Card key={category} className="px-4 py-2 bg-secondary/50">
                <span className="text-primary font-semibold">{category}</span>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {algorithms.map((algorithm) => (
            <AlgorithmCard key={algorithm.title} {...algorithm} />
          ))}
        </div>
      </div>
    </main>
  );
}