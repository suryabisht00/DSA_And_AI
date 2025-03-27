"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, Target } from "lucide-react";

export default function BinarySearchPage() {
  const [array, setArray] = useState<number[]>([]);
  const [left, setLeft] = useState<number>(0);
  const [right, setRight] = useState<number>(0);
  const [mid, setMid] = useState<number>(-1);
  const [target, setTarget] = useState<number>(0);
  const [found, setFound] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(500);
  const [arraySize, setArraySize] = useState<number>(15);
  const [algorithmStep, setAlgorithmStep] = useState<string>("");
  const [searchHistory, setSearchHistory] = useState<{left: number, right: number, mid: number}[]>([]);

  const generateRandomArray = () => {
    // Create a sorted array of random numbers
    const newArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100));
    newArray.sort((a, b) => a - b);
    setArray(newArray);
    
    // Select a random target (either from the array or not in the array)
    const randomTarget = Math.random() < 0.7 
      ? newArray[Math.floor(Math.random() * newArray.length)]
      : Math.floor(Math.random() * 100);
    
    setTarget(randomTarget);
    setLeft(0);
    setRight(newArray.length - 1);
    setMid(-1);
    setFound(-1);
    setAlgorithmStep("");
    setSearchHistory([]);
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const binarySearch = async () => {
    setIsRunning(true);
    setFound(-1);
    let left = 0;
    let right = array.length - 1;
    
    setLeft(left);
    setRight(right);
    setAlgorithmStep(`Starting binary search for target value: ${target}`);
    setSearchHistory([]);
    await delay(speed);

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      setMid(mid);
      
      // Add to search history
      setSearchHistory(prev => [...prev, {left, right, mid}]);
      
      setAlgorithmStep(`Checking mid element at index ${mid} with value ${array[mid]}`);
      await delay(speed);

      if (array[mid] === target) {
        setAlgorithmStep(`Found target ${target} at index ${mid}!`);
        setFound(mid);
        setIsRunning(false);
        return;
      }

      if (array[mid] < target) {
        setAlgorithmStep(`${array[mid]} < ${target}, so searching right half`);
        left = mid + 1;
        setLeft(left);
      } else {
        setAlgorithmStep(`${array[mid]} > ${target}, so searching left half`);
        right = mid - 1;
        setRight(right);
      }
      
      await delay(speed);
    }
    
    setAlgorithmStep(`Target ${target} not found in array`);
    setFound(-2); // -2 indicates "not found"
    setMid(-1);
    setIsRunning(false);
  };

  const getElementClass = (index: number) => {
    let classes = "flex items-center justify-center h-16 min-w-16 rounded-lg transition-all duration-300 transform border";

    // Default style
    classes += " bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700";
    
    // Element is the mid point
    if (index === mid) {
      classes += " bg-blue-100 dark:bg-blue-900/50 border-blue-500 ring-2 ring-blue-400 scale-105 shadow-lg";
    }
    
    // Element is the found target
    if (index === found) {
      classes += " bg-green-100 dark:bg-green-900/50 border-green-500 ring-4 ring-green-400 scale-110 shadow-xl";
    }
    
    // Element is in current search range (between left and right)
    if (index >= left && index <= right && mid !== -1) {
      classes += " bg-indigo-50 dark:bg-indigo-950/30";
    }
    
    // Element is outside current search range
    if ((index < left || index > right) && mid !== -1) {
      classes += " opacity-50";
    }

    return classes;
  };

  useEffect(() => {
    generateRandomArray();
  }, [arraySize]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Binary Search Visualization</h1>
      
      {/* Algorithm explanation */}
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
            <h3 className="text-xl font-semibold mb-2">Requirements</h3>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li><span className="font-medium">Sorted Array:</span> The input array must be sorted</li>
              <li><span className="font-medium">Random Access:</span> The algorithm requires O(1) access to any element</li>
              <li><span className="font-medium">Comparison:</span> Elements must be comparable (greater than, less than)</li>
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
              onClick={() => binarySearch()}
              disabled={isRunning}
              variant="default"
              className="flex items-center gap-2"
            >
              <Search size={16} />
              Start Search
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

          {/* Search configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <Card className="p-4 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Target Value</h3>
              <div className="flex items-center gap-2">
                <Target size={16} className="text-blue-500" />
                <span className="text-xl font-bold">{target}</span>
              </div>
            </Card>
            <Card className="p-4 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Search Range</h3>
              <div className="flex items-center gap-2">
                <ChevronLeft size={16} className="text-indigo-500" />
                <span>Left: {left}</span>
                <span className="mx-2">|</span>
                <span>Right: {right}</span>
                <ChevronRight size={16} className="text-indigo-500" />
              </div>
            </Card>
            <Card className="p-4 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                        <div className="font-medium">
                          {found === -1 && !isRunning && "Ready to search"}
                          {found === -2 && "Target not found"}
                          {found >= 0 && `Found at index ${found}`}
                          {isRunning && "Searching..."}
                        </div>
                      </Card>
                    </div>
                    
                    {/* Visualization goes here - add your visualization components */}
                    <div className="mt-6">
                      <div className="flex flex-wrap justify-center gap-2 my-4">
                        {array.map((num, index) => (
                          <div
                            key={index}
                            className={getElementClass(index)}
                          >
                            <span className="font-medium">{num}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Card className="p-4 mt-4 bg-slate-50 dark:bg-slate-900/50">
                        <h3 className="text-sm font-medium mb-2">Algorithm Step</h3>
                        <p>{algorithmStep}</p>
                      </Card>
                    </div>
                  </div>
                </Card>
              </div>
            );
          }