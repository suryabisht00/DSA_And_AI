"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Home, Play, Pause, RefreshCw } from "lucide-react";

export default function BubbleSortPage() {
  const [array, setArray] = useState<number[]>([]);
  const [comparing, setComparing] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [customInput, setCustomInput] = useState("");
  const [swapping, setSwapping] = useState<[number, number] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalComparisons, setTotalComparisons] = useState(0);
  const [totalSwaps, setTotalSwaps] = useState(0);
  const [algorithmStep, setAlgorithmStep] = useState("");
  
  const sortingRef = useRef<{ cancel: boolean }>({ cancel: false });
  const elementRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const generateRandomArray = () => {
    const size = window.innerWidth < 640 ? 8 : window.innerWidth < 1024 ? 12 : 16;
    const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 50) + 1);
    resetState(newArray);
  };

  const resetState = (newArray: number[] = array) => {
    setArray(newArray);
    setComparing([]);
    setSorted([]);
    setSwapping(null);
    setCurrentStep(0);
    setTotalComparisons(0);
    setTotalSwaps(0);
    setAlgorithmStep("");
    sortingRef.current.cancel = false;
    setIsRunning(false);
    setIsPaused(false);
    
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  };

  const handleCustomInput = () => {
    try {
      const numbers = customInput.split(",")
        .map(num => parseInt(num.trim()))
        .filter(num => !isNaN(num));
        
      if (numbers.length > 0) {
        resetState(numbers);
      }
    } catch (error) {
      console.error("Invalid input format");
    }
  };

  const delay = (ms: number) => {
    return new Promise(resolve => {
      animationRef.current = setTimeout(resolve, ms);
    });
  };

  const animateSwap = async (idx1: number, idx2: number) => {
    setSwapping([idx1, idx2]);
    setAlgorithmStep(`Swapping elements: ${array[idx1]} > ${array[idx2]}`);
    
    const elem1 = elementRefs.current[idx1];
    const elem2 = elementRefs.current[idx2];
    
    if (elem1 && elem2) {
      // Calculate distance between elements
      const rect1 = elem1.getBoundingClientRect();
      const rect2 = elem2.getBoundingClientRect();
      const distance = rect2.left - rect1.left;
      
      // Apply transition for smooth animation
      elem1.style.transition = `transform ${300 - speed[0] * 2}ms ease-in-out`;
      elem2.style.transition = `transform ${300 - speed[0] * 2}ms ease-in-out`;
      
      // Move elements
      elem1.style.transform = `translateX(${distance}px)`;
      elem2.style.transform = `translateX(${-distance}px)`;
      
      // Wait for animation to complete
      await delay(320 - speed[0] * 2);
      
      // Reset transition and transform for instant positioning after swap
      elem1.style.transition = 'none';
      elem2.style.transition = 'none';
      elem1.style.transform = '';
      elem2.style.transform = '';
    }
  };

  const bubbleSort = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setIsPaused(false);
    sortingRef.current.cancel = false;
    const n = array.length;
    const newArray = [...array];
    
    // Reset all stats
    setTotalComparisons(0);
    setTotalSwaps(0);
    setCurrentStep(0);
    setSorted([]);
    
    setAlgorithmStep("Starting Bubble Sort algorithm");
    await delay(800 - speed[0] * 7);
    
    let swapsMade = false;
    
    for (let i = 0; i < n - 1; i++) {
      if (sortingRef.current.cancel) break;
      swapsMade = false;
      
      setAlgorithmStep(`Pass ${i+1}: Bubbling largest unsorted element to the end`);
      await delay(800 - speed[0] * 7);
      
      for (let j = 0; j < n - i - 1; j++) {
        if (sortingRef.current.cancel) break;
        if (isPaused) {
          await new Promise(resolve => {
            const checkPause = () => {
              if (!isPaused || sortingRef.current.cancel) {
                resolve(undefined);
              } else {
                setTimeout(checkPause, 100);
              }
            };
            checkPause();
          });
        }
        
        // Set the elements being compared
        setComparing([j, j + 1]);
        setTotalComparisons(prev => prev + 1);
        setCurrentStep(prev => prev + 1);
        
        setAlgorithmStep(`Comparing ${newArray[j]} and ${newArray[j + 1]}`);
        await delay(800 - speed[0] * 7);
        
        if (newArray[j] > newArray[j + 1]) {
          // Animate swap
          await animateSwap(j, j + 1);
          
          // Actual swap
          const temp = newArray[j];
          newArray[j] = newArray[j + 1];
          newArray[j + 1] = temp;
          
          setArray([...newArray]);
          setTotalSwaps(prev => prev + 1);
          swapsMade = true;
        } else {
          setAlgorithmStep(`${newArray[j]} ≤ ${newArray[j + 1]}, no swap needed`);
          await delay(400 - speed[0] * 3);
        }
        
        setComparing([]);
        setSwapping(null);
      }
      
      // Mark the largest element as sorted
      setSorted(prev => [...prev, n - 1 - i]);
      
      setAlgorithmStep(`Element ${newArray[n - 1 - i]} is now in correct position`);
      await delay(800 - speed[0] * 7);
      
      // If no swaps were made in this pass, the array is sorted
      if (!swapsMade) {
        setAlgorithmStep("No swaps in this pass. Array is sorted!");
        break;
      }
    }
    
    // Mark all elements as sorted
    setSorted(Array.from({ length: n }, (_, i) => i));
    setComparing([]);
    setSwapping(null);
    setAlgorithmStep("Array is now fully sorted!");
    setIsRunning(false);
  };

  const pauseAnimation = () => {
    setIsPaused(true);
  };
  
  const resumeAnimation = () => {
    setIsPaused(false);
  };
  
  const stopSorting = () => {
    sortingRef.current.cancel = true;
    setIsRunning(false);
    setIsPaused(false);
    setComparing([]);
    setSwapping(null);
    
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  };

  const getElementClass = (index: number) => {
    let classes = "flex flex-col items-center justify-center rounded-lg transition-all duration-300 shadow-md";

    // Element in sorted portion of array
    if (sorted.includes(index)) {
      classes += " bg-green-400 dark:bg-green-600 border border-green-600";
    }
    // Elements being compared
    else if (comparing.includes(index)) {
      classes += " bg-amber-400 dark:bg-amber-600 border border-amber-600 ring-4 ring-amber-300";
    }
    // Elements being swapped
    else if (swapping && swapping.includes(index)) {
      classes += " bg-red-400 dark:bg-red-600 border border-red-600";
    }
    // Unsorted elements
    else {
      classes += " bg-blue-400 dark:bg-blue-600 border border-blue-500";
    }

    return classes;
  };

  useEffect(() => {
    generateRandomArray();
    
    const handleResize = () => {
      if (!isRunning) generateRandomArray();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Bubble Sort Visualization</h1>
      
      <div className="flex justify-center mb-8">
        <Link 
          href="/" 
          className="flex items-center gap-1 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-full transition-colors"
        >
          <Home className="h-4 w-4" /> Back to Home
        </Link>
      </div>
      
      {/* Algorithm explanation */}
      <Card className="p-6 mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <h2 className="text-2xl font-semibold mb-4">About Bubble Sort</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Overview</h3>
            <p className="text-muted-foreground mb-4">
              Bubble sort is a simple comparison-based sorting algorithm that repeatedly steps through the list,
              compares adjacent elements, and swaps them if they are in the wrong order.
            </p>
            <div className="mb-2">
              <span className="font-semibold text-sm">Time Complexity:</span>
              <span className="ml-2 text-sm bg-red-100 dark:bg-red-900 px-2 py-1 rounded-md">O(n²)</span>
            </div>
            <div>
              <span className="font-semibold text-sm">Space Complexity:</span>
              <span className="ml-2 text-sm bg-green-100 dark:bg-green-900 px-2 py-1 rounded-md">O(1)</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Key Concepts</h3>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Compares adjacent elements and swaps them if they're in the wrong order</li>
              <li>Largest unsorted element "bubbles" to the end in each pass</li>
              <li>Simple to implement but inefficient for large datasets</li>
              <li>Optimization: Stop early if no swaps occur in a pass</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Button 
              onClick={bubbleSort} 
              disabled={isRunning && !isPaused || array.length <= 1}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-1" /> Run Bubble Sort
            </Button>
            
            <Button 
              onClick={generateRandomArray} 
              disabled={isRunning && !isPaused}
              variant="secondary"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Generate Random Array
            </Button>
            
            {isRunning && (
              <Button
                onClick={isPaused ? resumeAnimation : pauseAnimation}
                variant="outline"
                className="border-amber-500 text-amber-600"
              >
                {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
            )}

            {isRunning && (
              <Button
                onClick={stopSorting}
                variant="destructive"
                size="sm"
              >
                Stop
              </Button>
            )}
            
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm whitespace-nowrap">Speed:</span>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                min={1}
                max={100}
                step={1}
                disabled={isRunning && !isPaused}
                className="w-32"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="custom-input">Custom Array (comma-separated)</Label>
              <Input
                id="custom-input"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g., 8,3,5,1,9,2"
                disabled={isRunning && !isPaused}
              />
            </div>
            <Button 
              onClick={handleCustomInput} 
              disabled={isRunning && !isPaused}
              variant="outline"
            >
              Set Custom Array
            </Button>
          </div>

          {/* Algorithm statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <Card className="p-4 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Comparisons</h3>
              <p className="text-2xl font-bold">{totalComparisons}</p>
            </Card>
            <Card className="p-4 bg-amber-50 dark:bg-amber-900/30">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Swaps</h3>
              <p className="text-2xl font-bold">{totalSwaps}</p>
            </Card>
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/30">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Step</h3>
              <p className="text-2xl font-bold">{currentStep}</p>
            </Card>
          </div>

          {/* Step description */}
          {algorithmStep && (
            <Card className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border border-teal-100 dark:border-teal-900">
              <h3 className="text-sm font-medium mb-1">Current Step</h3>
              <p className="text-md">{algorithmStep}</p>
            </Card>
          )}
        </div>
      </Card>

      {/* Array visualization */}
      <Card className="p-6 mb-8 bg-slate-50 dark:bg-slate-900/20">
        <h2 className="text-xl font-semibold mb-4">Visualization</h2>
        <div className="flex flex-col items-center">
          <div className="flex flex-wrap justify-center gap-2 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg min-h-[200px]">
            {array.map((value, index) => (
              <div 
                key={index}
                ref={(el) => elementRefs.current[index] = el}
                className={getElementClass(index)}
                style={{
                  width: "64px",
                  height: "64px"
                }}
              >
                <span className="text-lg font-bold text-white">{value}</span>
                <span className="text-xs mt-1 text-white">idx: {index}</span>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-blue-400 dark:bg-blue-600 border border-blue-500"></div>
              <span>Unsorted Element</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-amber-400 dark:bg-amber-600 border border-amber-600"></div>
              <span>Comparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-red-400 dark:bg-red-600 border border-red-600"></div>
              <span>Swapping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-green-400 dark:bg-green-600 border border-green-600"></div>
              <span>Sorted Element</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Algorithm walkthrough */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">How Bubble Sort Works</h2>
        <ol className="list-decimal pl-5 space-y-3">
          <li>Start from the first element, compare with the next element.</li>
          <li>If the current element is greater than the next element, swap them.</li>
          <li>Move to the next pair of adjacent elements and repeat step 2.</li>
          <li>After completing one full pass through the array, the largest element will have "bubbled up" to the end.</li>
          <li>Repeat the process for all elements except the last sorted ones.</li>
          <li>The algorithm can be optimized by stopping if no swaps occur in a pass, indicating the array is sorted.</li>
        </ol>

        <div className="mt-6 p-4 border bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 rounded-md">
          <h3 className="text-lg font-medium mb-2">Why Is It Called Bubble Sort?</h3>
          <p>
            The name "bubble sort" comes from the way smaller elements "bubble" to the top (beginning) of the list.
            In each iteration, the largest unsorted element "bubbles up" to its correct position at the end of the unsorted portion of the array,
            similar to how air bubbles rise to the surface in a liquid.
          </p>
        </div>
      </Card>

      <div className="flex justify-center mb-8">
        <Link 
          href="/algorithms" 
          className="flex items-center gap-1 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-full transition-colors"
        >
          <Home className="h-4 w-4" /> Back to Algorithms
        </Link>
      </div>
    </div>
  );
}