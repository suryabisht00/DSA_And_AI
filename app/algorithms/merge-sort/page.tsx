"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Home, Play, Pause, SkipBack, SkipForward, RefreshCw } from "lucide-react";

export default function MergeSortPage() {
  const [array, setArray] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [customInput, setCustomInput] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [sortingSteps, setSortingSteps] = useState<{
    arrays: number[][];
    description: string;
    phase: 'divide' | 'conquer';
    path?: string;
    treeState?: Map<string, { array: number[], status: 'active' | 'inactive' | 'merged' }>;
  }[]>([]);
  const [autoMode, setAutoMode] = useState(true);
  const [activeNodes, setActiveNodes] = useState<string[]>([]);

  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const generateRandomArray = () => {
    const size = window.innerWidth < 640 ? 6 : window.innerWidth < 1024 ? 8 : 10;
    const newArray = Array.from(
      { length: size },
      () => Math.floor(Math.random() * 50) + 1
    );
    resetVisualization(newArray);
  };

  const resetVisualization = (newArray: number[]) => {
    setArray(newArray);
    setCurrentStep(0);
    setSortingSteps([]);
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
        resetVisualization(numbers);
      }
    } catch (error) {
      console.error("Invalid input format");
    }
  };

  const collectMergeSortSteps = (arr: number[]) => {
    const steps: {
      arrays: number[][];
      description: string;
      phase: 'divide' | 'conquer';
      path?: string;
      treeState?: Map<string, { array: number[], status: 'active' | 'inactive' | 'merged' }>;
    }[] = [];

    const treeState = new Map<string, { array: number[], status: 'active' | 'inactive' | 'merged' }>();
    const initialPath = "0";
    treeState.set(initialPath, { array: arr.slice(), status: 'active' });

    steps.push({
      arrays: [arr.slice()],
      description: "Starting with the unsorted array",
      phase: 'divide',
      path: initialPath,
      treeState: new Map(treeState)
    });

    const mergeSortWithSteps = (array: number[], path: string): number[] => {
      if (array.length <= 1) {
        return array;
      }

      const mid = Math.floor(array.length / 2);
      const leftArray = array.slice(0, mid);
      const rightArray = array.slice(mid);

      const leftPath = `${path}-L`;
      const rightPath = `${path}-R`;

      treeState.set(leftPath, { array: leftArray, status: 'active' });
      treeState.set(rightPath, { array: rightArray, status: 'active' });

      steps.push({
        arrays: [leftArray, rightArray],
        description: `Dividing [${array.join(', ')}] into [${leftArray.join(', ')}] and [${rightArray.join(', ')}]`,
        phase: 'divide',
        path,
        treeState: new Map(treeState)
      });

      const sortedLeft = mergeSortWithSteps(leftArray, leftPath);
      const sortedRight = mergeSortWithSteps(rightArray, rightPath);

      treeState.set(leftPath, { array: sortedLeft, status: 'merged' });
      treeState.set(rightPath, { array: sortedRight, status: 'merged' });

      steps.push({
        arrays: [sortedLeft, sortedRight],
        description: `Merging [${sortedLeft.join(', ')}] and [${sortedRight.join(', ')}]`,
        phase: 'conquer',
        path,
        treeState: new Map(treeState)
      });

      const merged = merge(sortedLeft, sortedRight);

      treeState.set(path, { array: merged, status: 'merged' });

      steps.push({
        arrays: [merged],
        description: `Merged into [${merged.join(', ')}]`,
        phase: 'conquer',
        path,
        treeState: new Map(treeState)
      });

      return merged;
    };

    const merge = (left: number[], right: number[]): number[] => {
      const result = [];
      let i = 0, j = 0;

      while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
          result.push(left[i]);
          i++;
        } else {
          result.push(right[j]);
          j++;
        }
      }

      while (i < left.length) {
        result.push(left[i]);
        i++;
      }

      while (j < right.length) {
        result.push(right[j]);
        j++;
      }

      return result;
    };

    const arrCopy = [...arr];
    const sorted = mergeSortWithSteps(arrCopy, initialPath);

    steps.push({
      arrays: [sorted],
      description: "Array is now fully sorted",
      phase: 'conquer',
      path: initialPath,
      treeState: new Map(treeState)
    });

    return steps;
  };

  const startMergeSort = () => {
    if (isRunning || array.length <= 1) return;

    setIsRunning(true);
    setIsPaused(false);
    setCurrentStep(0);

    const steps = collectMergeSortSteps([...array]);
    setSortingSteps(steps);

    if (autoMode) {
      runNextStep(0, steps);
    }
  };

  const runNextStep = (step: number, steps: any[]) => {
    if (step >= steps.length) {
      setIsRunning(false);
      return;
    }

    setCurrentStep(step);

    const delay = 1500 - (speed[0] * 10);

    animationRef.current = setTimeout(() => {
      if (!isPaused) {
        runNextStep(step + 1, steps);
      }
    }, delay);
  };

  const pauseAnimation = () => {
    setIsPaused(true);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  };

  const resumeAnimation = () => {
    setIsPaused(false);
    runNextStep(currentStep + 1, sortingSteps);
  };

  const stopAnimation = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStep(0);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  };

  const goToNextStep = () => {
    if (currentStep < sortingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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

  const currentVisualization = sortingSteps[currentStep] || {
    arrays: [array],
    description: "Ready to start sorting",
    phase: 'divide' as const
  };

  const progress = sortingSteps.length > 0
    ? Math.round((currentStep / (sortingSteps.length - 1)) * 100)
    : 0;

  const renderMergeSortTree = (treeState: Map<string, { array: number[], status: string }>) => {
    const renderNode = (path: string) => {
      const node = treeState.get(path);
      if (!node) return null;

      const isCurrentPath = currentVisualization?.path === path;
      const statusColor = node.status === 'merged' ? 'bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-800' :
        isCurrentPath ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/20 dark:border-blue-800' :
          'bg-slate-100 border-slate-300 dark:bg-slate-800/50 dark:border-slate-700';

      return (
        <div className={`px-3 py-2 rounded-lg border ${statusColor} ${isCurrentPath ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
          <div className="flex items-center justify-center">
            {node.array.map((value, index) => (
              <div key={index} className="px-0.5">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full 
                                text-xs font-medium
                                ${node.status === 'merged' ? 'bg-green-500 text-white' :
                    isCurrentPath ? 'bg-blue-500 text-white' : 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col items-center space-y-6">
        <div>{renderNode("0")}</div>
        <div className="flex space-x-16">
          {renderNode("0-L")}
          {renderNode("0-R")}
        </div>
        <div className="flex space-x-8">
          {renderNode("0-L-L")}
          {renderNode("0-L-R")}
          {renderNode("0-R-L")}
          {renderNode("0-R-R")}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Merge Sort Visualization</h1>
      
      <div className="flex justify-center mb-6">
        <Link href="/" className="flex items-center gap-1 text-sm px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800">
          <Home className="h-4 w-4" /> Back to Home
        </Link>
      </div>

      {/* Controls section */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button
              onClick={startMergeSort}
              disabled={isRunning && !isPaused || array.length <= 1}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-1" /> Sort
            </Button>

            <Button
              onClick={generateRandomArray}
              disabled={isRunning && !isPaused}
              variant="secondary"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> New Array
            </Button>

            {isRunning && (
              <Button
                onClick={isPaused ? resumeAnimation : pauseAnimation}
                variant="outline"
              >
                {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
            )}

            {isRunning && (
              <Button
                onClick={stopAnimation}
                variant="destructive"
                size="sm"
              >
                Stop
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-1 w-32">
            <Label htmlFor="speed" className="text-xs">Speed</Label>
            <Slider
              id="speed"
              value={speed}
              onValueChange={setSpeed}
              min={1}
              max={100}
              step={1}
              disabled={isRunning && !isPaused}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-end">
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
            Set Array
          </Button>

          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-md p-1">
            <button
              onClick={() => setAutoMode(true)}
              className={`px-3 py-1 text-xs rounded-md transition ${autoMode ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
              disabled={isRunning && !isPaused}
            >
              Auto
            </button>
            <button
              onClick={() => setAutoMode(false)}
              className={`px-3 py-1 text-xs rounded-md transition ${!autoMode ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
              disabled={isRunning && !isPaused}
            >
              Step-by-step
            </button>
          </div>

          {isRunning && !autoMode && (
            <div className="flex items-center gap-1">
              <Button
                onClick={goToPrevStep}
                variant="outline"
                size="sm"
                disabled={currentStep <= 0}
                className="h-8 w-8 p-0"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                onClick={goToNextStep}
                variant="outline"
                size="sm"
                disabled={currentStep >= sortingSteps.length - 1}
                className="h-8 w-8 p-0"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {isRunning && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm font-medium">{currentVisualization?.description || "Ready to start sorting"}</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-4 lg:col-span-1">
          <h3 className="text-lg font-medium mb-4 text-center">Before & After</h3>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2 text-slate-500">Original Array</h4>
              <div className="flex justify-center items-center p-3 border rounded-md min-h-12">
                {array.map((value, index) => (
                  <div key={index} className="px-1">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-medium text-sm">
                      {value}
                    </span>
                    {index < array.length - 1 && (
                      <span className="text-slate-400 mx-0.5">,</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 text-slate-500">Sorted Array</h4>
              <div className="flex justify-center items-center p-3 border rounded-md min-h-12">
                {sortingSteps.length > 0 ? (
                  sortingSteps[sortingSteps.length - 1].arrays[0].map((value, index) => (
                    <div key={index} className="px-1">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full 
                                     bg-green-100 dark:bg-green-900/40 
                                     text-green-800 dark:text-green-300 
                                     font-medium text-sm`}>
                        {value}
                      </span>
                      {index < sortingSteps[sortingSteps.length - 1].arrays[0].length - 1 && (
                        <span className="text-slate-400 mx-0.5">,</span>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-slate-400">Run the algorithm to see the sorted array</span>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2">
          <h3 className="text-lg font-medium mb-4 text-center">Current Operation</h3>

          <div className="bg-slate-50 dark:bg-slate-900/30 rounded-md p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                {currentVisualization?.phase === 'divide' ? 'DIVIDING' : 'MERGING'}
              </span>
              <span className="text-xs text-slate-500">
                Step {currentStep + 1} of {sortingSteps.length}
              </span>
            </div>

            <p className="text-sm font-medium mb-4">{currentVisualization?.description}</p>

            <div className="space-y-4">
              {currentVisualization?.arrays.map((subArray, arrayIndex) => (
                <div key={arrayIndex} className="border-l-4 pl-3 py-1"
                  style={{ borderLeftColor: arrayIndex === 0 && currentVisualization.arrays.length > 1
                    ? '#3b82f6' : arrayIndex === 1 ? '#a855f7' : '#22c55e' }}>
                  <div className="text-xs mb-2 font-medium" style={{ color: arrayIndex === 0 && currentVisualization.arrays.length > 1
                    ? '#3b82f6' : arrayIndex === 1 ? '#a855f7' : '#22c55e' }}>
                    {currentVisualization.arrays.length > 1
                      ? arrayIndex === 0 ? "Left Subarray" : "Right Subarray"
                      : currentVisualization.phase === 'divide' ? "Array to Split" : "Merged Result"}
                  </div>
                  <div className="flex flex-wrap items-center">
                    {subArray.map((value, index) => (
                      <div key={index} className="px-1 mb-1">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full 
                                       ${arrayIndex === 0 && currentVisualization.arrays.length > 1
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'
                          : arrayIndex === 1
                            ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300'
                            : 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'} 
                                       font-medium text-sm`}>
                          {value}
                        </span>
                        {index < subArray.length - 1 && (
                          <span className="text-slate-400 mx-0.5">,</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Sort Progress</h4>
            <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all"
                style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-500">Unsorted</span>
              <span className="text-xs text-slate-500">Sorted</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 mb-6">
        <h3 className="text-lg font-medium mb-4 text-center">Merge Sort Tree</h3>
        <p className="text-sm text-slate-500 text-center mb-4">
          This visualization shows how the array is recursively divided and conquered
        </p>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[600px]">
            <div className="flex flex-col items-center">
              {currentVisualization?.treeState && renderMergeSortTree(currentVisualization.treeState)}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">About Merge Sort</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <span className="font-semibold">Time Complexity:</span> O(n log n)
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
            <span className="font-semibold">Space Complexity:</span> O(n)
          </div>
        </div>

        <h3 className="text-lg font-medium mb-2">How It Works</h3>
        <ol className="list-decimal pl-5 space-y-2 mb-4">
          <li><strong>Divide:</strong> Split the array into two halves until you have single-element arrays</li>
          <li><strong>Conquer:</strong> Merge the smaller arrays back together in sorted order</li>
          <li><strong>Merge Process:</strong> Compare elements from both arrays and take the smaller one first</li>
        </ol>

        <div className="flex flex-wrap gap-3 text-sm mb-4">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            <span>Array to Divide</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
            <span>Array to Compare</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <span>Merged Result</span>
          </div>
        </div>

        <p className="text-sm">
          Merge sort is efficient and stable with guaranteed O(n log n) performance.
          It's ideal for large datasets, but requires extra memory for the merging process.
        </p>
      </Card>

      <div className="flex justify-center">
        <Link
          href="/algorithms"
          className="flex items-center gap-1 text-sm px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800"
        >
          <Home className="h-4 w-4" /> Back to Algorithms
        </Link>
      </div>
    </div>
  );
}