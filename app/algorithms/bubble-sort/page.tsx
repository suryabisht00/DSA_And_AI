"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export default function BubbleSortPage() {
  const [array, setArray] = useState<number[]>([]);
  const [comparing, setComparing] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [customInput, setCustomInput] = useState("");
  const [swapping, setSwapping] = useState<[number, number] | null>(null);
  const elementRefs = useRef<(HTMLDivElement | null)[]>([]);

  const generateRandomArray = () => {
    const newArray = Array.from({ length: 10 }, () => Math.floor(Math.random() * 50) + 1);
    setArray(newArray);
    setComparing([]);
    setSorted([]);
  };

  const handleCustomInput = () => {
    const numbers = customInput.split(",").map(num => parseInt(num.trim()));
    if (numbers.every(num => !isNaN(num))) {
      setArray(numbers);
      setComparing([]);
      setSorted([]);
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const bubbleSort = async () => {
    setIsRunning(true);
    const n = array.length;
    const newArray = [...array];
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setComparing([j, j + 1]);
        await sleep(1000 - speed[0] * 9);
        
        if (newArray[j] > newArray[j + 1]) {
          setSwapping([j, j + 1]);
          
          const elem1 = elementRefs.current[j];
          const elem2 = elementRefs.current[j + 1];
          
          if (elem1 && elem2) {
            const distance = elem2.offsetLeft - elem1.offsetLeft;
            elem1.style.setProperty('--swap-distance', `${distance}px`);
            elem2.style.setProperty('--swap-distance', `-${distance}px`);
            
            elem1.classList.add('swap-right');
            elem2.classList.add('swap-left');
            
            await sleep(500);
            
            elem1.classList.remove('swap-right');
            elem2.classList.remove('swap-left');
          }
          
          const temp = newArray[j];
          newArray[j] = newArray[j + 1];
          newArray[j + 1] = temp;
          setArray([...newArray]);
          
          setSwapping(null);
        }
      }
      setSorted(prev => [...prev, n - 1 - i]);
    }
    setSorted(Array.from({ length: n }, (_, i) => i));
    setComparing([]);
    setIsRunning(false);
  };

  useEffect(() => {
    generateRandomArray();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Bubble Sort Visualization</h1>
      
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
              onClick={() => bubbleSort()} 
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
                  : swapping && swapping.includes(index)
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