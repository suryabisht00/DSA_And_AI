"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export default function MergeSortPage() {
  const [array, setArray] = useState<number[]>([]);
  const [auxiliaryArray, setAuxiliaryArray] = useState<number[]>([]);
  const [comparing, setComparing] = useState<number[]>([]);
  const [merging, setMerging] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [customInput, setCustomInput] = useState("");

  // Add reference for element positions
  const elementRefs = useRef<(HTMLDivElement | null)[]>([]);

  const generateRandomArray = () => {
    const newArray = Array.from({ length: 10 }, () => Math.floor(Math.random() * 50) + 1);
    setArray(newArray);
    setAuxiliaryArray([...newArray]);
    setComparing([]);
    setMerging([]);
    setSorted([]);
  };

  const handleCustomInput = () => {
    const numbers = customInput.split(",").map(num => parseInt(num.trim()));
    if (numbers.every(num => !isNaN(num))) {
      setArray(numbers);
      setAuxiliaryArray([...numbers]);
      setComparing([]);
      setMerging([]);
      setSorted([]);
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Enhance the merge function to animate element movement
  const merge = async (start: number, mid: number, end: number) => {
    let i = start;
    let j = mid + 1;
    let k = start;
    const tempArray = [...array];

    while (i <= mid && j <= end) {
      setComparing([i, j]);
      await sleep(1000 - speed[0] * 9);

      if (auxiliaryArray[i] <= auxiliaryArray[j]) {
        // Animate the element moving to its new position
        animateMove(i, k, tempArray, auxiliaryArray[i]);
        i++;
      } else {
        // Animate the element moving to its new position
        animateMove(j, k, tempArray, auxiliaryArray[j]);
        j++;
      }
      setMerging([k]);
      k++;
      await sleep(1000 - speed[0] * 9);
    }

    while (i <= mid) {
      tempArray[k] = auxiliaryArray[i];
      setMerging([k]);
      setArray(tempArray);
      i++;
      k++;
      await sleep(1000 - speed[0] * 9);
    }

    while (j <= end) {
      tempArray[k] = auxiliaryArray[j];
      setMerging([k]);
      setArray(tempArray);
      j++;
      k++;
      await sleep(1000 - speed[0] * 9);
    }

    for (let i = start; i <= end; i++) {
      auxiliaryArray[i] = tempArray[i];
    }

    // Update the array state and wait for any animations to complete
    setArray([...tempArray]);
  };

  // Add function for animating the movement of elements
  const animateMove = async (fromIdx: number, toIdx: number, tempArray: number[], value: number) => {
    // Only animate if the positions are different
    if (fromIdx !== toIdx) {
      const fromElem = elementRefs.current[fromIdx];
      const toElem = elementRefs.current[toIdx];

      if (fromElem && toElem) {
        // Calculate horizontal distance
        const deltaX = toElem.offsetLeft - fromElem.offsetLeft;

        // Set the distance for animation
        fromElem.style.setProperty('--swap-distance', `${deltaX}px`);

        // Add animation class based on direction
        if (deltaX > 0) {
          fromElem.classList.add('swap-right');
        } else {
          fromElem.classList.add('swap-left');
        }

        // Wait for animation to complete
        await sleep(500);

        // Remove animation classes
        fromElem.classList.remove('swap-right', 'swap-left');
      }
    }

    // Update the array value
    tempArray[toIdx] = value;
  };

  const mergeSortHelper = async (start: number, end: number) => {
    if (start < end) {
      const mid = Math.floor((start + end) / 2);
      await mergeSortHelper(start, mid);
      await mergeSortHelper(mid + 1, end);
      await merge(start, mid, end);
      setSorted(prev => [...prev, ...Array.from({ length: end - start + 1 }, (_, i) => start + i)]);
    }
  };

  const mergeSort = async () => {
    setIsRunning(true);
    await mergeSortHelper(0, array.length - 1);
    setComparing([]);
    setMerging([]);
    setSorted(Array.from({length: array.length}, (_, i) => i));
    setIsRunning(false);
  };

  useEffect(() => {
    generateRandomArray();
  }, []);

  // Update the visualization rendering to include refs
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Merge Sort Visualization</h1>

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
              onClick={() => mergeSort()} 
              disabled={isRunning}
              variant="default"
            >
              Start Sorting
            </Button>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="custom-input">Custom Input (comma-separated numbers)</Label>
              <Input
                id="custom-input"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g., 5,2,8,1,9"
                disabled={isRunning}
              />
            </div>
            <Button 
              onClick={handleCustomInput} 
              disabled={isRunning}
              variant="outline"
            >
              Set Custom Array
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Animation Speed</Label>
            <Slider
              value={speed}
              onValueChange={setSpeed}
              min={1}
              max={100}
              step={1}
              disabled={isRunning}
            />
          </div>
        </div>
      </Card>

      <div className="visualization-container">
        <div className="flex items-end justify-center gap-2 h-full">
          {array.map((value, index) => (
            <div
              key={index}
              ref={(el) => elementRefs.current[index] = el}
              className={`array-element w-12 ${
                sorted.includes(index)
                  ? 'bg-green-500'
                  : comparing.includes(index)
                  ? 'bg-red-500'
                  : merging.includes(index)
                  ? 'bg-purple-500'
                  : 'bg-blue-500'
              } transition-colors`}
              style={{ 
                height: `${Math.max(value * 5, 20)}px`,
              }}
            >
              <span className="text-xs font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}