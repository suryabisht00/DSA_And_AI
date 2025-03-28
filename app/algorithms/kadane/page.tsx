"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Home } from "lucide-react";

export default function KadanePage() {
  const [array, setArray] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [currentSum, setCurrentSum] = useState<number>(0);
  const [maxSum, setMaxSum] = useState<number>(0);
  const [maxRange, setMaxRange] = useState<[number, number]>([-1, -1]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(500);
  const [tempStart, setTempStart] = useState<number>(0);
  const [algorithmStep, setAlgorithmStep] = useState<string>("");
  const [arraySize, setArraySize] = useState<number>(15);

  const generateRandomArray = () => {
    const newArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 40) - 20);
    setArray(newArray);
    setCurrentIndex(-1);
    setCurrentSum(0);
    setMaxSum(0);
    setMaxRange([-1, -1]);
    setTempStart(0);
    setAlgorithmStep("");
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const kadane = async () => {
    setIsRunning(true);
    let currentSum = 0;
    let maxSum = Number.MIN_SAFE_INTEGER;
    let start = 0;
    let end = 0;
    let tempStart = 0;

    setCurrentSum(0);
    setMaxSum(Number.MIN_SAFE_INTEGER);
    setMaxRange([-1, -1]);
    setTempStart(0);

    for (let i = 0; i < array.length; i++) {
      setCurrentIndex(i);
      
      // Update current sum
      currentSum += array[i];
      setCurrentSum(currentSum);
      setAlgorithmStep(`Adding element ${array[i]} to current sum: ${currentSum}`);
      await delay(speed);

      // Check if current sum is greater than max sum
      if (currentSum > maxSum) {
        maxSum = currentSum;
        start = tempStart;
        end = i;
        setMaxSum(maxSum);
        setMaxRange([start, end]);
        setAlgorithmStep(`New maximum sum found: ${maxSum} from index ${start} to ${end}`);
        await delay(speed);
      }

      // If current sum becomes negative, reset it
      if (currentSum < 0) {
        setAlgorithmStep(`Current sum ${currentSum} is negative. Resetting to 0 and starting new subarray from index ${i + 1}`);
        currentSum = 0;
        tempStart = i + 1;
        setCurrentSum(currentSum);
        setTempStart(tempStart);
        await delay(speed);
      }
    }
    
    setAlgorithmStep(`Algorithm completed! Maximum subarray sum: ${maxSum} from index ${maxRange[0]} to ${maxRange[1]}`);
    setIsRunning(false);
    setCurrentIndex(-1);
  };

  useEffect(() => {
    generateRandomArray();
  }, [arraySize]);

  const getElementClass = (index: number) => {
    let classes = "flex flex-col items-center justify-center h-16 w-16 rounded-lg transition-all duration-300 transform";

    // Base style based on value
    if (array[index] < 0) {
      classes += " bg-red-100 dark:bg-red-900/30 border border-red-400";
    } else {
      classes += " bg-green-100 dark:bg-green-900/30 border border-green-400";
    }

    // Current element being processed
    if (index === currentIndex) {
      classes += " ring-4 ring-blue-500 scale-105 shadow-lg";
    }

    // Element in maximum subarray
    if (maxRange[0] <= index && index <= maxRange[1]) {
      classes += " bg-amber-100 dark:bg-amber-800/50 border-amber-500";
      if (index === maxRange[0] || index === maxRange[1]) {
        classes += " ring-2 ring-amber-500";
      }
    }

    // Current subarray being considered
    if (tempStart <= index && index <= currentIndex && currentSum > 0) {
      classes += " border-blue-500";
    }

    return classes;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Kadane's Algorithm Visualization</h1>
      
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
        <h2 className="text-2xl font-semibold mb-4">About Kadane's Algorithm</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Overview</h3>
            <p className="text-muted-foreground mb-4">
              Kadane's algorithm finds the maximum sum subarray in a one-dimensional array of numbers in linear time.
              It uses dynamic programming to solve this problem efficiently.
            </p>
            <div className="mb-2">
              <span className="font-semibold text-sm">Time Complexity:</span>
              <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md">O(n)</span>
            </div>
            <div>
              <span className="font-semibold text-sm">Space Complexity:</span>
              <span className="ml-2 text-sm bg-green-100 dark:bg-green-900 px-2 py-1 rounded-md">O(1)</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Key Concepts</h3>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Maintains running sum of the current subarray</li>
              <li>If the current sum becomes negative, discard the current subarray and start a new one</li>
              <li>The maximum subarray sum is tracked throughout the process</li>
              <li>Works with both positive and negative numbers</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 flex-wrap">
            <Button
              onClick={generateRandomArray}
              disabled={isRunning}
              variant="secondary"
            >
              Generate Random Array
            </Button>
            <Button
              onClick={() => kadane()}
              disabled={isRunning}
              variant="default"
            >
              Run Kadane's Algorithm
            </Button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm whitespace-nowrap">Array Size:</span>
              <Input 
                type="number" 
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                min={5}
                max={30}
                className="w-20"
                disabled={isRunning}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm whitespace-nowrap">Speed:</span>
              <Slider
                disabled={isRunning}
                value={[speed]}
                onValueChange={(value) => setSpeed(1000 - value[0])}
                max={950}
                min={50}
                step={50}
                className="w-32"
              />
            </div>
          </div>

          {/* Algorithm statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <Card className="p-4 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Sum</h3>
              <p className="text-2xl font-bold">{currentSum}</p>
            </Card>
            <Card className="p-4 bg-amber-50 dark:bg-amber-900/30">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Maximum Sum</h3>
              <p className="text-2xl font-bold">{maxSum === Number.MIN_SAFE_INTEGER ? 0 : maxSum}</p>
            </Card>
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/30">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Maximum Subarray</h3>
              <p className="text-2xl font-bold">
                {maxRange[0] !== -1 ? `[${maxRange[0]}, ${maxRange[1]}]` : "None"}
              </p>
            </Card>
          </div>

          {/* Step description */}
          {algorithmStep && (
            <Card className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border border-teal-100 dark:border-teal-900">
              <h3 className="text-sm font-medium mb-1">Current Step</h3>
              <p className="text-md">{algorithmStep}</p>
            </Card>
          )}

          {/* Array visualization */}
          <div className="flex flex-col items-center mt-4">
            <div className="flex flex-wrap justify-center gap-2 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
              {array.map((value, index) => (
                <div key={index} className={getElementClass(index)}>
                  <span className="text-lg font-bold">{value}</span>
                  <span className="text-xs mt-1">idx: {index}</span>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-green-100 dark:bg-green-900/30 border border-green-400"></div>
                <span>Positive Value</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-red-100 dark:bg-red-900/30 border border-red-400"></div>
                <span>Negative Value</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-blue-100 dark:bg-blue-900/30 ring-4 ring-blue-500"></div>
                <span>Current Element</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-amber-100 dark:bg-amber-800/50 border border-amber-500"></div>
                <span>Maximum Subarray</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Algorithm walkthrough */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">How Kadane's Algorithm Works</h2>
        <ol className="list-decimal pl-5 space-y-3">
          <li>Initialize two variables: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">currentSum = 0</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">maxSum = MIN_SAFE_INTEGER</code></li>
          <li>Iterate through each element of the array.</li>
          <li>Add the current element to <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">currentSum</code>.</li>
          <li>If <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">currentSum {`>`} maxSum</code>, update <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">maxSum = currentSum</code> and record the current subarray bounds.</li>
          <li>If <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">currentSum {`<`} 0</code>, reset <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">currentSum = 0</code> since carrying a negative sum would only reduce future subarrays' sums.</li>
          <li>After processing the entire array, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">maxSum</code> contains the maximum subarray sum.</li>
        </ol>

        <div className="mt-6 p-4 border bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 rounded-md">
          <h3 className="text-lg font-medium mb-2">Why This Works</h3>
          <p>
            The key insight is that if the sum of a subarray becomes negative, there's no reason to continue including those elements in future subarrays. 
            By resetting to zero whenever the current sum becomes negative, we ensure we're always considering the optimal starting position.
          </p>
        </div>
      </Card>
    </div>
  );
}