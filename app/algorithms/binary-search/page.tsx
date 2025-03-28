"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Home, Play, Pause, RefreshCw, Search, ArrowLeftRight } from "lucide-react";

export default function BinarySearchPage() {
  const [array, setArray] = useState<number[]>([]);
  const [left, setLeft] = useState<number>(0);
  const [right, setRight] = useState<number>(0);
  const [mid, setMid] = useState<number>(-1);
  const [target, setTarget] = useState<number>(0);
  const [customTarget, setCustomTarget] = useState<string>("");
  const [found, setFound] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number[]>([50]);
  const [arraySize, setArraySize] = useState<number>(15);
  const [algorithmStep, setAlgorithmStep] = useState<string>("");
  const [searchHistory, setSearchHistory] = useState<{left: number, right: number, mid: number}[]>([]);
  const [comparisons, setComparisons] = useState<number>(0);
  const [customInput, setCustomInput] = useState<string>("");
  
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const elementRefs = useRef<(HTMLDivElement | null)[]>([]);

  const generateRandomArray = () => {
    const size = Math.min(Math.max(5, arraySize), 30);
    const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
    newArray.sort((a, b) => a - b);
    const uniqueArray = Array.from(new Set(newArray));
    while (uniqueArray.length < size) {
      const newNum = Math.floor(Math.random() * 100);
      if (!uniqueArray.includes(newNum)) {
        uniqueArray.push(newNum);
      }
    }
    uniqueArray.sort((a, b) => a - b);
    setArray(uniqueArray);
    const randomTarget = Math.random() < 0.7 
      ? uniqueArray[Math.floor(Math.random() * uniqueArray.length)]
      : Math.floor(Math.random() * 100);
    resetSearch(uniqueArray, randomTarget);
  };

  const resetSearch = (arr = array, targetValue = target) => {
    setTarget(targetValue);
    setLeft(0);
    setRight(arr.length - 1);
    setMid(-1);
    setFound(-1);
    setAlgorithmStep("");
    setSearchHistory([]);
    setComparisons(0);
    setIsRunning(false);
    setIsPaused(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  };

  const handleCustomArray = () => {
    try {
    const numbers = customInput
      .split(",")
      .map(num => parseInt(num.trim()))
      .filter(num => !isNaN(num));
    if (numbers.length > 0) {
      const uniqueNumbers = Array.from(new Set(numbers)).sort((a, b) => a - b);
      setArray(uniqueNumbers);
      const newTarget = target || uniqueNumbers[Math.floor(Math.random() * uniqueNumbers.length)];
      resetSearch(uniqueNumbers, newTarget);
    }
    } catch (error) {
      console.error("Invalid input format");
    }
  };

  const handleCustomTarget = () => {
    const newTarget = parseInt(customTarget.trim());
    if (!isNaN(newTarget)) {
      resetSearch(array, newTarget);
    }
  };

  const delay = (ms: number) => {
    return new Promise(resolve => {
      animationRef.current = setTimeout(resolve, ms);
    });
  };

  const binarySearch = async () => {
    setIsRunning(true);
    setIsPaused(false);
    setFound(-1);
    let leftIdx = 0;
    let rightIdx = array.length - 1;
    setLeft(leftIdx);
    setRight(rightIdx);
    setAlgorithmStep(`Starting binary search for target value: ${target}`);
    setSearchHistory([]);
    setComparisons(0);
    await delay(1000 - speed[0] * 9);

    while (leftIdx <= rightIdx) {
      if (isPaused) {
        await new Promise(resolve => {
          const checkPause = () => {
            if (!isPaused) {
              resolve(undefined);
            } else {
              setTimeout(checkPause, 100);
            }
          };
          checkPause();
        });
      }
      const midIdx = Math.floor((leftIdx + rightIdx) / 2);
      setMid(midIdx);
      setSearchHistory(prev => [...prev, {left: leftIdx, right: rightIdx, mid: midIdx}]);
      setAlgorithmStep(`Checking mid element at index ${midIdx} with value ${array[midIdx]}`);
      await delay(1000 - speed[0] * 9);
      setComparisons(prev => prev + 1);
      if (array[midIdx] === target) {
        setAlgorithmStep(`Found target ${target} at index ${midIdx}!`);
        setFound(midIdx);
        const foundElement = elementRefs.current[midIdx];
        if (foundElement) {
          foundElement.classList.add('animate-pulse');
        }
        await delay(1000 - speed[0] * 9);
        setIsRunning(false);
        return;
      }
      if (array[midIdx] < target) {
        setAlgorithmStep(`${array[midIdx]} < ${target}, searching right half [${midIdx + 1}...${rightIdx}]`);
        leftIdx = midIdx + 1;
        setLeft(leftIdx);
      } else {
        setAlgorithmStep(`${array[midIdx]} > ${target}, searching left half [${leftIdx}...${midIdx - 1}]`);
        rightIdx = midIdx - 1;
        setRight(rightIdx);
      }
      await delay(1000 - speed[0] * 9);
    }
    setAlgorithmStep(`Target ${target} not found in array`);
    setFound(-2);
    setMid(-1);
    await delay(1000 - speed[0] * 9);
    setIsRunning(false);
  };

  const pauseSearch = () => {
    setIsPaused(true);
  };
  
  const resumeSearch = () => {
    setIsPaused(false);
  };
  
  const stopSearch = () => {
    setIsRunning(false);
    setIsPaused(false);
    setMid(-1);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  };

  const getElementClass = (index: number) => {
    let classes = "flex flex-col items-center justify-center transition-all duration-300 border rounded-lg";
    classes += " bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-sm";
    if (index === mid) {
      classes += " bg-blue-100 dark:bg-blue-900/50 border-blue-500 ring-2 ring-blue-400 shadow-lg scale-105";
    }
    if (index === found) {
      classes += " bg-green-100 dark:bg-green-900/50 border-green-500 ring-4 ring-green-400 shadow-xl scale-110";
    }
    if (index >= left && index <= right && mid !== -1) {
      classes += " bg-indigo-50 dark:bg-indigo-950/30";
    }
    if ((index < left || index > right) && mid !== -1) {
      classes += " opacity-50";
    }
    if (array[index] === target && found !== index) {
      classes += " border-amber-400 dark:border-amber-600";
    }
    return classes;
  };

  useEffect(() => {
    generateRandomArray();
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Binary Search Visualization</h1>
      
      <div className="flex justify-center mb-8">
        <Link 
          href="/" 
          className="flex items-center gap-1 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-full transition-colors"
        >
          <Home className="h-4 w-4" /> Back to Algorithms
        </Link>
      </div>
      
      <Card className="p-6 mb-8 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
        <h2 className="text-2xl font-semibold mb-4">About Binary Search</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Overview</h3>
            <p className="text-muted-foreground mb-4">
              Binary search is a divide-and-conquer algorithm that efficiently finds a target value 
              within a sorted array by repeatedly dividing the search space in half.
            </p>
            <div className="mb-2">
              <span className="font-semibold text-sm">Time Complexity:</span>
              <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md">O(log n)</span>
            </div>
            <div>
              <span className="font-semibold text-sm">Space Complexity:</span>
              <span className="ml-2 text-sm bg-green-100 dark:bg-green-900 px-2 py-1 rounded-md">O(1)</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Key Concepts</h3>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Requires a <strong>sorted</strong> array to function correctly</li>
              <li>Divides search space in half with each step</li>
              <li>Compares target with middle element</li>
              <li>Much faster than linear search for large datasets</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Button 
              onClick={binarySearch}
              disabled={isRunning && !isPaused || array.length === 0}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="h-4 w-4 mr-1" /> Search for {target}
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
                onClick={isPaused ? resumeSearch : pauseSearch}
                variant="outline"
                className="border-amber-500 text-amber-600"
              >
                {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
            )}

            {isRunning && (
              <Button
                onClick={stopSearch}
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
                placeholder="e.g., 8,13,15,21,29,32"
                disabled={isRunning && !isPaused}
              />
              <p className="text-xs text-muted-foreground mt-1">Elements will be sorted automatically</p>
            </div>
            <Button 
              onClick={handleCustomArray} 
              disabled={isRunning && !isPaused}
              variant="outline"
            >
              Set Custom Array
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="custom-target">Custom Target Value</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-target"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  placeholder="e.g., 21"
                  disabled={isRunning && !isPaused}
                />
                <Button 
                  onClick={handleCustomTarget} 
                  disabled={isRunning && !isPaused}
                  variant="outline"
                >
                  Set Target
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="array-size">Array Size</Label>
              <Input 
                id="array-size"
                type="number" 
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                min={5}
                max={30}
                className="w-20"
                disabled={isRunning && !isPaused}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <Card className="p-4 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Target Value</h3>
              <div className="flex items-center gap-2">
                <div className="bg-amber-100 dark:bg-amber-900/30 w-8 h-8 flex items-center justify-center rounded-full border border-amber-400">
                  <span className="font-bold">{target}</span>
                </div>
                <p className="text-2xl font-bold">{target}</p>
              </div>
            </Card>
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/30">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Comparisons</h3>
              <p className="text-2xl font-bold">{comparisons}</p>
            </Card>
            <Card className="p-4 bg-green-50 dark:bg-green-900/30">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
              <p className="text-xl font-bold">
                {found === -1 && !isRunning && "Ready to search"}
                {found === -2 && "Target not found"}
                {found >= 0 && `Found at index ${found}`}
                {isRunning && "Searching..."}
              </p>
            </Card>
          </div>

          {isRunning && (
            <Card className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 border">
              <h3 className="text-sm font-medium mb-2">Current Search Range</h3>
              <div className="flex items-center gap-2">
                <span className="font-medium">Left: {left}</span>
                <ArrowLeftRight className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Right: {right}</span>
                {mid !== -1 && (
                  <>
                    <span className="mx-2">|</span>
                    <span className="font-medium text-blue-600">Mid: {mid}</span>
                  </>
                )}
              </div>
            </Card>
          )}

          {algorithmStep && (
            <Card className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border border-teal-100 dark:border-teal-900">
              <h3 className="text-sm font-medium mb-1">Current Step</h3>
              <p className="text-md">{algorithmStep}</p>
            </Card>
          )}
        </div>
      </Card>

      <Card className="p-6 mb-8 bg-slate-50 dark:bg-slate-900/20">
        <h2 className="text-xl font-semibold mb-4">Visualization</h2>
        <div className="flex flex-col items-center">
          <div className="flex flex-wrap justify-center gap-2 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg min-h-[150px]">
            {array.map((num, index) => (
              <div
                key={index}
                ref={(el) => elementRefs.current[index] = el}
                className={getElementClass(index)}
                style={{
                  width: "60px",
                  height: "60px"
                }}
              >
                <span className={`text-lg font-bold ${num === target ? 'text-amber-600 dark:text-amber-400' : ''}`}>{num}</span>
                <span className="text-xs mt-1 text-muted-foreground">idx: {index}</span>
              </div>
            ))}
          </div>
          
          {searchHistory.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Search History</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {searchHistory.map((step, idx) => (
                  <Card key={idx} className={`p-3 text-sm ${idx === searchHistory.length - 1 ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'bg-slate-50 dark:bg-slate-900/10'}`}>
                    <p className="font-medium mb-1">Step {idx + 1}</p>
                    <div className="grid grid-cols-3 gap-1">
                      <div>Left: {step.left}</div>
                      <div>Mid: {step.mid}</div>
                      <div>Right: {step.right}</div>
                    </div>
                    <div className="mt-1 text-xs">
                      {array[step.mid] === target ? (
                        <span className="text-green-600 dark:text-green-400">Found!</span>
                      ) : array[step.mid] < target ? (
                        <span className="text-blue-600 dark:text-blue-400">Go right</span>
                      ) : (
                        <span className="text-purple-600 dark:text-purple-400">Go left</span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-indigo-50 dark:bg-indigo-950/30 border border-slate-300 rounded"></div>
              <span>Current Range</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-blue-100 dark:bg-blue-900/50 border border-blue-500 rounded"></div>
              <span>Mid Element</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-green-100 dark:bg-green-900/50 border border-green-500 rounded"></div>
              <span>Found Target</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border border-amber-400 dark:border-amber-600 rounded"></div>
              <span>Target Value</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">How Binary Search Works</h2>
        <ol className="list-decimal pl-5 space-y-3">
          <li>Start with a <strong>sorted</strong> array and define the search range (initially the entire array).</li>
          <li>Find the middle element of the current search range.</li>
          <li>If the middle element is the target, return its position.</li>
          <li>If the target is smaller than the middle element, search the left half.</li>
          <li>If the target is larger than the middle element, search the right half.</li>
          <li>Repeat steps 2-5 until the target is found or the search range is empty.</li>
        </ol>

        <div className="mt-6 p-4 border bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 rounded-md">
          <h3 className="text-lg font-medium mb-2">Why Binary Search is Efficient</h3>
          <p>
            Binary search is extremely efficient because it eliminates half of the remaining elements in each step.
            This gives it a logarithmic time complexity of O(log n). For example, in an array of 1 million elements,
            binary search would require at most 20 comparisons, while linear search might need up to 1 million.
          </p>
        </div>
      </Card>


      
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .animate-pulse {
          animation: pulse 0.5s ease infinite;
          box-shadow: 0 0 10px rgba(72, 187, 120, 0.7);
        }
      `}</style>
    </div>
  );
}