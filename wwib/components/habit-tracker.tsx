'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Heart, Brain, Dumbbell, Book, Users, ArrowRight, Moon, Cigarette, Target, Smile, Droplet, Wine, Smartphone, Utensils, Camera } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import React from 'react'
import Image from 'next/image'
import finalPixelImage from '@/assets/final_pixel.png'
import goodLeo from '@/assets/good_leo_1.png'
import badLeo from '@/assets/bad_leo_1.png'

// Import obstacle images
import obstacle1 from '@/assets/obstacle_1.png'
import obstacle2 from '@/assets/obstacle_2.png'
import obstacle3 from '@/assets/obstacle_3.png'
import obstacle4 from '@/assets/obstacle_4.png'
import obstacle5 from '@/assets/obstacle_5.png'

// Import obstacle images for the second game screen
import obstacleB1 from '@/assets/obstacle_b1.png'
import obstacleB2 from '@/assets/obstacle_b2.png'
import obstacleB3 from '@/assets/obstacle_b3.png'

// Arrays of obstacle images
const obstacleImages = [obstacle1, obstacle2, obstacle3, obstacle4, obstacle5] // First game screen
const obstacleBImages = [obstacleB1, obstacleB2, obstacleB3] // Second game screen

// Server URL constant
export const SERVER_URL = 'https://326a-91-167-190-195.ngrok-free.app/';

const categories = [
  { name: 'Sleep', icon: Moon },
  { name: 'Diet', icon: Utensils },
  { name: 'Exercise', icon: Dumbbell },
  { name: 'Smoking', icon: Cigarette },
  { name: 'Alcohol', icon: Wine },
  { name: 'Social relationships', icon: Users },
  { name: 'Mental health', icon: Brain },
  { name: 'Motivation', icon: Target },
  { name: 'Hydration', icon: Droplet },
  { name: 'Stress management', icon: Smile },
  { name: 'Screen time', icon: Smartphone },
]

const GAME_HEIGHT = 200;
const GAME_WIDTH = 600;
const DINO_WIDTH = 44;
const DINO_HEIGHT = 47;
const JUMP_HEIGHT = 100;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 40;

import DiploSVG from '@/assets/diplodocus.svg';

const DinoSprite = ({ isJumping }: { isJumping: boolean }) => (
  <div className={`w-full h-full ${isJumping ? 'animate-jump' : ''}`}>
    <Image
      src={finalPixelImage}
      alt="Pixel character"
      layout="fill"
      objectFit="contain"
    />
  </div>
);

interface SimulationResults {
  life_simulation: {
    actions: Array<Record<string, string>>;
    states: string[];
  };
}

export function HabitTrackerComponent() {
  const [habits, setHabits] = useState({})
  let [summaryGood, setSummaryGood] = useState('');
  let [summaryBad, setSummaryBad] = useState('');
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<Record<string, string[]> | null>(null)
  const [simulating, setSimulating] = useState(false) 
  const [showingResults, setShowingResults] = useState(false)
  const [dogImage, setDogImage] = useState('')
  const [goodImage, setGoodImage] = useState('')
  const [badImage, setBadImage] = useState('')
  const [dinoY, setDinoY] = useState(GAME_HEIGHT - DINO_HEIGHT);
  const [isJumping, setIsJumping] = useState(false);
  const [cactusX, setCactusX] = useState(GAME_WIDTH);
  const [score, setScore] = useState(0);
  const [simulationResults, setSimulationResults] = useState<SimulationResults | null>(null);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [isColliding, setIsColliding] = useState(false);
  const [currentObstacleIndex, setCurrentObstacleIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // State variables for the second game screen
  const [dinoBY, setDinoBY] = useState(GAME_HEIGHT - DINO_HEIGHT);
  const [isJumpingB, setIsJumpingB] = useState(false);
  const [cactusBX, setCactusBX] = useState(GAME_WIDTH);
  const [currentObstacleBIndex, setCurrentObstacleBIndex] = useState(0);
  const [isCollidingB, setIsCollidingB] = useState(false);
  const [scoreB, setScoreB] = useState(0);

  // New state variable for simulationResultsB
  const [simulationResultsB, setSimulationResultsB] = useState<SimulationResults | null>(null);
  const [currentStateIndexB, setCurrentStateIndexB] = useState(0);

  const handleInputChange = (category: string, value: string) => {
    setHabits(prev => ({ ...prev, [category]: value }))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Concatenate all habits
      const allHabits = Object.values(habits).join(' ');

      // Call the generate-program endpoint
      const response = await fetch(`${SERVER_URL}generate-program`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          user_query: allHabits,
        }),
        mode: 'cors',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setRecommendations(data.program);
      console.log('Generated recommendations:', data.program);

      // Run both simulate-life endpoint calls in parallel
      const [simulationResponse, simulationResponseB] = await Promise.all([
        fetch(`${SERVER_URL}simulate-life`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            initial_state: allHabits,
            program: JSON.stringify(data.program),
            time_horizon: 10, // Adjusted to match the game duration
          }),
          mode: 'cors',
        }),
        fetch(`${SERVER_URL}simulate-life`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            initial_state: allHabits,
            program: "Keep doing what you're doing",
            time_horizon: 10, // Adjusted to match the game duration
          }),
          mode: 'cors',
        }),
      ]);

      // Check if both responses are OK
      if (!simulationResponse.ok || !simulationResponseB.ok) {
        throw new Error(
          `HTTP error! Statuses: ${simulationResponse.status}, ${simulationResponseB.status}`
        );
      }

      // Parse both simulation results
      const [simulationData, simulationDataB] = await Promise.all([
        simulationResponse.json(),
        simulationResponseB.json(),
      ]);

      setSimulationResults(simulationData);
      console.log('Simulation results:', simulationData);

      setSimulationResultsB(simulationDataB);
      console.log('Simulation results B:', simulationDataB);

      setLoading(false);
    } catch (error) {
      console.error('Error generating recommendations or simulating life:', error);
      setLoading(false);
    }
  };

  const startSimulation = () => {
    setSimulating(true)
  }

  const showResults = () => {
    setShowingResults(true)
  }

  const fetchDogImage = async () => {
    try {
      const response = await fetch('https://dog.ceo/api/breeds/image/random')
      const data = await response.json()
      setDogImage(data.message)
    } catch (error) {
      console.error('Error fetching dog image:', error)
    }
  }


  // Jump function for the first game screen
  const jump = useCallback(() => {
    if (!isJumping) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 500);
    }
  }, [isJumping]);

  // Event listener for jump on the first game screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  // Game loop for the first game screen
  useEffect(() => {
    if (simulating && !showingResults && simulationResults?.life_simulation) {
      const gameLoop = setInterval(() => {
        // Update obstacle position
        setCactusX((prev) => {
          if (prev <= -OBSTACLE_WIDTH) {
            // Move to the next state in simulationResults
            setCurrentStateIndex((prevIndex) => {
              const newIndex = prevIndex + 1;
              if (newIndex >= simulationResults.life_simulation.states.length) {
                // End of simulation, show results
                clearInterval(gameLoop);
                setSimulating(false);
                setShowingResults(true);
                return prevIndex;
              }
              return newIndex;
            });
            // Update score or other game elements based on the current state
            // For example, you can parse the state to determine the player's health or other metrics
            
            // Reset obstacle position
            setCurrentObstacleIndex((prevIndex) => (prevIndex + 1) % obstacleImages.length);
            return GAME_WIDTH;
          }
          return prev - 5;
        });

        // Update dinosaur position (jump/fall)
        setDinoY((prev) => {
          if (isJumping) {
            return Math.max(GAME_HEIGHT - DINO_HEIGHT - JUMP_HEIGHT, prev - 10);
          } else {
            return Math.min(GAME_HEIGHT - DINO_HEIGHT, prev + 10);
          }
        });

        // Collision detection for the first game screen
        if (
          cactusX < DINO_WIDTH + 20 &&
          cactusX + OBSTACLE_WIDTH > 20 &&
          dinoY + DINO_HEIGHT > GAME_HEIGHT - OBSTACLE_HEIGHT
        ) {
          if (!isColliding) {
            setIsColliding(true);
            // Handle collision based on current state
            // For example, adjust score or player health
            setTimeout(() => setIsColliding(false), 1000); // Pause for 1 second
          }
        }
      }, 1000 / 60);

      return () => clearInterval(gameLoop);
    }
  }, [simulating, showingResults, cactusX, dinoY, isJumping, isColliding, simulationResults, currentStateIndex]);

  // Jump function for the second game screen
  const jumpB = useCallback(() => {
    if (!isJumpingB) {
      setIsJumpingB(true);
      setTimeout(() => setIsJumpingB(false), 500);
    }
  }, [isJumpingB]);

  // Event listener for jump on the second game screen
  useEffect(() => {
    const handleKeyDownB = (e: KeyboardEvent) => {
      if (e.code === 'KeyS') { // You can choose any key, using 'S' for example
        jumpB();
      }
    };
    window.addEventListener('keydown', handleKeyDownB);
    return () => window.removeEventListener('keydown', handleKeyDownB);
  }, [jumpB]);

  // Game loop for the second game screen
  useEffect(() => {
    if (simulating && !showingResults && simulationResultsB?.life_simulation) {
      const gameLoopB = setInterval(() => {
        // Update obstacle position
        setCactusBX((prev) => {
          if (prev <= -OBSTACLE_WIDTH) {
            // Move to the next state in simulationResultsB
            setCurrentStateIndexB((prevIndex) => {
              const newIndex = prevIndex + 1;
              if (newIndex >= simulationResultsB.life_simulation.states.length) {
                // End of simulation, show results
                clearInterval(gameLoopB);
                setSimulating(false);
                setShowingResults(true);
                return prevIndex;
              }
              return newIndex;
            });
            // Update score or other game elements based on the current state

            // Reset obstacle position
            setCurrentObstacleBIndex((prevIndex) => (prevIndex + 1) % obstacleBImages.length);
            return GAME_WIDTH;
          }
          return prev - 5;
        });

        // Update dinosaur position (jump/fall)
        setDinoBY((prev) => {
          if (isJumpingB) {
            return Math.max(GAME_HEIGHT - DINO_HEIGHT - JUMP_HEIGHT, prev - 10);
          } else {
            return Math.min(GAME_HEIGHT - DINO_HEIGHT, prev + 10);
          }
        });

        // Collision detection for the second game screen
        if (
          cactusBX < DINO_WIDTH + 20 &&
          cactusBX + OBSTACLE_WIDTH > 20 &&
          dinoBY + DINO_HEIGHT > GAME_HEIGHT - OBSTACLE_HEIGHT
        ) {
          if (!isCollidingB) {
            setIsCollidingB(true);
            // Handle collision based on current state
            // For example, adjust score or player health
            setTimeout(() => setIsCollidingB(false), 1000); // Pause for 1 second
          }
        }
      }, 1000 / 60);

      return () => clearInterval(gameLoopB);
    }
  }, [simulating, showingResults, cactusBX, dinoBY, isJumpingB, isCollidingB, simulationResultsB, currentStateIndexB]);

  useEffect(() => {
    if (showingResults) {
      fetchDogImage()
    }
  }, [showingResults])

  if (showingResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <h2 className="text-2xl font-bold mb-8">Your Results</h2>
        <div className="w-full max-w-6xl flex space-x-8">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-center text-green-600">With the new program </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-200 rounded-lg mb-4 relative">
                <Image
                  src={goodLeo}
                  alt="Good version of you"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
              <p className="text-center">This version of you followed the recommended habits consistently.</p>
              <div className="flex flex-col items-center">
                <Button 
                  className={`mt-8 ${loading ? 'opacity-50' : ''}`} 
                  onClick={() => {
                    if (summaryGood) return; // Prevent multiple clicks
                    setLoading(true);

                    fetch(SERVER_URL + 'summarize-states', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        actions: [
                          {
                            "Alcohol": "I do not have any information on that category",
                            "Diet": "I start replacing some of my processed meals with whole food options, like adding a salad to my dinner or having fruit for a snack.",
                            "Exercise": "I continue going to the gym 3 times a week and add one short run to my weekly routine.",
                            "Hydration": "I continue drinking plenty of water throughout the day.",
                            "Mental health": "I try a short mindfulness exercise, like a 5-minute guided meditation, a few times this week.",
                            "Motivation": "none",
                            "Screen time": "I do not have any information on that category",
                            "Sleep": "I maintain my current sleep schedule of 10 p.m. to 6 a.m.",
                            "Smoking": "I do not have any information on that category",
                            "Social relationships": "I do not have any information on that category",
                            "Stress management": "none"
                          },
                          {
                            "Alcohol": "I do not have any information on that category",
                            "Diet": "I continue to incorporate more whole foods into my diet alongside some processed meals.",
                            "Exercise": "I continue my routine of three gym sessions and one short run per week.",
                            "Hydration": "I drink plenty of water daily.",
                            "Mental health": "I practice short mindfulness exercises a few times a week.",
                            "Motivation": "I maintain my motivation to continue these positive changes.",
                            "Screen time": "I do not have any information on that category",
                            "Sleep": "I maintain a consistent sleep schedule of 10 p.m. to 6 a.m.",
                            "Smoking": "I do not have any information on that category",
                            "Social relationships": "I do not have any information on that category",
                            "Stress management": "I do not have any information on that category"
                          }
                        ],
                        category: "program",
                        states: [
                          "I maintain good overall hygiene. I continue to prioritize hydration, drinking plenty of water daily. My sleep schedule remains consistent, sleeping from 10 p.m. to 6 a.m., which allows me to feel quite well-rested.  I now incorporate a short run once a week in addition to my three gym sessions.  I am beginning to incorporate more whole foods into my diet, alongside some processed meals. I've also started practicing short mindfulness exercises a few times a week.  I'm motivated to continue these positive changes.\n",
                          "I maintain good overall hygiene. I prioritize hydration, drinking plenty of water daily. My sleep schedule remains consistent, sleeping from 10 p.m. to 6 a.m., which allows me to feel well-rested. I incorporate a short run once a week in addition to my three gym sessions. I continue to incorporate more whole foods into my diet, alongside some processed meals.  I practice short mindfulness exercises a few times a week. I remain motivated to continue these positive changes.\n"
                        ]
                      }),
                    })
                      .then(response => response.json())
                      .then(data => {
                        setSummaryGood(data.summary);
                        console.log(data.summary);
                        
                        return fetch(`${SERVER_URL}text-to-speech`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            gender: 'M',
                            text: data.summary
                          }),
                        });
                      })
                      .then(response => response.json())
                      .then(data => {
                        const audioContent = data.audio_content;
                        const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
                        const audioUrl = URL.createObjectURL(audioBlob);
                        const audio = new Audio(audioUrl);
                        audio.play();
                        setLoading(false);
                      })
                      .catch(error => {
                        console.error('Error:', error);
                        setLoading(false);
                      });
                  }}
                  disabled={loading || !!summaryGood}
                >
                  {loading ? (
                    <span className="inline-flex items-center">
                      <span className="animate-pulse">generating your summary</span>
                      <span className="animate-pulse delay-75">.</span>
                      <span className="animate-pulse delay-150">.</span>
                      <span className="animate-pulse delay-300">.</span>
                    </span>
                  ) : summaryGood ? (
                    'Summary Generated'
                  ) : (
                    'Summarize your journey'
                  )}
                </Button>
                
              {summaryGood && (
                  <div className="mt-4 p-4 bg-white rounded-lg shadow w-full">
                    <p>{summaryGood}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-center text-red-600">If you keep on like this</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-200 rounded-lg mb-4 relative">
                <Image
                  src={badLeo}
                  alt="Bad version of you"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
              <p className="text-center">This version of you didn't follow the recommended habits.</p>
              <div className="flex flex-col items-center">
                <Button 
                  className={`mt-8 ${loading ? 'opacity-50' : ''}`} 
                  onClick={() => {
                    if (summaryBad) return; // Prevent multiple clicks
                    setLoading(true);

                    fetch(SERVER_URL + 'summarize-states', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        actions: simulationResultsB?.life_simulation?.actions,
                        category: "habits",
                        states: simulationResultsB?.life_simulation?.states,
                      }),
                    })
                      .then(response => response.json())
                      .then(data => {
                        const summaryBad = data.summary;
                        setSummaryBad(summaryBad);
                        console.log(summaryBad);
                        
                        return fetch(`${SERVER_URL}text-to-speech`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            gender: 'M',
                            text: summaryBad
                          }),
                        });
                      })
                      .then(response => response.json())
                      .then(data => {
                        const audioContent = data.audio_content;
                        const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
                        const audioUrl = URL.createObjectURL(audioBlob);
                        const audio = new Audio(audioUrl);
                        audio.play();
                        setLoading(false);
                        
                        // Start streaming the summary
                        let index = 0;
                        const streamInterval = setInterval(() => {
                          if (index < summaryBad.length) {
                            setSummaryBad(prevSummary => prevSummary + summaryBad[index]);
                            index++;
                          } else {
                            clearInterval(streamInterval);
                          }
                        }, 50); // Adjust the interval for faster/slower streaming
                      })
                      .catch(error => {
                        console.error('Error:', error);
                        setLoading(false);
                      });
                  }}
                  disabled={loading || !!summaryBad}
                >
                  {loading ? (
                    <span className="inline-flex items-center">
                      <span className="animate-pulse">generating your summary</span>
                      <span className="animate-pulse delay-75">.</span>
                      <span className="animate-pulse delay-150">.</span>
                      <span className="animate-pulse delay-300">.</span>
                    </span>
                  ) : summaryBad ? (
                    'Summary Generated'
                  ) : (
                    'Summarize your journey'
                  )}
                </Button>
                
                {summaryBad && (
                  <div className="mt-4 p-4 bg-white rounded-lg shadow w-full">
                    <p>{summaryBad}</p>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
        <Button className="mt-8" onClick={() => {
          setShowingResults(false)
          setSimulating(false)
          setDogImage('')
        }}>
          Start Over
        </Button>
      </div>
    )
  }

  if (simulating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <h2 className="text-2xl font-bold mb-4">Life Simulation</h2>
        <div className="w-full max-w-6xl space-y-8">
          {/* First Game Screen */}
          <div className="flex justify-center">
            <div 
              className="bg-white border-2 border-black overflow-hidden cursor-pointer relative" 
              style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
              onClick={jump}
            >
              {/* Dino for the first game screen */}
              <div
                className={`absolute ${isColliding ? 'opacity-50' : ''}`}
                style={{
                  width: DINO_WIDTH,
                  height: DINO_HEIGHT,
                  bottom: dinoY - (GAME_HEIGHT - DINO_HEIGHT),
                  left: 20,
                  transition: isColliding ? 'opacity 0.2s' : 'none',
                }}
              >
                <Image
                  src={finalPixelImage}
                  alt="Character"
                  layout="fill"
                  objectFit="contain"
                  className={isJumping ? 'animate-jump' : ''}
                />
              </div>

              {/* Obstacle for the first game screen */}
              <div
                className="absolute"
                style={{
                  width: OBSTACLE_WIDTH,
                  height: OBSTACLE_HEIGHT,
                  bottom: 0,
                  left: cactusX,
                }}
              >
                <Image
                  src={obstacleImages[currentObstacleIndex]}
                  alt="Obstacle"
                  layout="fill"
                  objectFit="contain"
                />
              </div>

              {/* Ground */}
              <div className="absolute bottom-0 w-full h-1 bg-black" />

              {/* Score */}
              <div className="absolute top-2 right-2 text-xl font-bold">
                Score: {score}
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm" aria-live="polite">
              State: {simulationResults?.life_simulation?.states[currentStateIndex] ?? 'Loading...'}
            </p>
            <p className="text-sm mt-2" aria-live="polite">
              {isColliding ? 'Oops! Collision!' : 'Jump with Spacebar or click'}
            </p>
          </div>

          {/* Second Game Screen */}
          <div className="flex justify-center mt-8">
            <div 
              className="bg-white border-2 border-black overflow-hidden cursor-pointer relative" 
              style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
              onClick={jumpB}
            >
              {/* Dino for the second game screen */}
              <div
                className={`absolute ${isCollidingB ? 'opacity-50' : ''}`}
                style={{
                  width: DINO_WIDTH,
                  height: DINO_HEIGHT,
                  bottom: dinoBY - (GAME_HEIGHT - DINO_HEIGHT),
                  left: 20,
                  transition: isCollidingB ? 'opacity 0.2s' : 'none',
                }}
              >
                <Image
                  src={finalPixelImage}
                  alt="Character"
                  layout="fill"
                  objectFit="contain"
                  className={isJumpingB ? 'animate-jump' : ''}
                />
              </div>

              {/* Obstacle for the second game screen */}
              <div
                className="absolute"
                style={{
                  width: OBSTACLE_WIDTH,
                  height: OBSTACLE_HEIGHT,
                  bottom: 0,
                  left: cactusBX,
                }}
              >
                <Image
                  src={obstacleBImages[currentObstacleBIndex]}
                  alt="Obstacle"
                  layout="fill"
                  objectFit="contain"
                />
              </div>

              {/* Ground */}
              <div className="absolute bottom-0 w-full h-1 bg-black" />

              {/* Score */}
              <div className="absolute top-2 right-2 text-xl font-bold">
                Score: {scoreB}
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm" aria-live="polite">
              State: {simulationResultsB?.life_simulation?.states[currentStateIndex] ?? 'Loading...'}
            </p>
            <p className="text-sm mt-2" aria-live="polite">
              {isCollidingB ? 'Oops! Collision!' : 'Jump with "S" key or click'}
            </p>
          </div>
        </div>
        <div className="flex space-x-4 mt-8">
          <Button onClick={() => setSimulating(false)}>Back to Recommendations</Button>
          <Button onClick={showResults}>See Results</Button>
        </div>
      </div>
    )
  }

  if (recommendations) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <h2 className="text-2xl font-bold mb-4">AI Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(recommendations).map(([category, actions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {React.createElement(categories.find(c => c.name === category)?.icon || Heart, { className: "mr-2" })}
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5">
                  {Object.values(actions).map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        {simulationResults && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Simulation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Life Simulation</h3>
                  <p>{simulationResults.life_simulation.states[0]}</p>
                </div>
                {simulationResults.life_simulation.actions[0] && (
                  <div>
                    <h3 className="font-bold mb-2">Actions Taken</h3>
                    <ul className="list-disc pl-5">
                      {Object.entries(simulationResults.life_simulation.actions[0]).map(([category, action]) => (
                        <li key={category}>
                          <span className="font-semibold">{category}:</span> {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        <Button className="mt-4" onClick={startSimulation}>Simulate</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Daily Habits Tracker</CardTitle>
          <CardDescription>Enter your daily habits for different life categories</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            {/* Photo upload widget */}
            <div>
              <Label htmlFor="photo-upload">Upload Your Photo</Label>
              <div className="flex items-center mt-2">
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label
                  htmlFor="photo-upload"
                  className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none"
                >
                  {selectedFile ? (
                    <span className="text-sm text-gray-600">
                      {selectedFile.name}
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <Camera className="w-6 h-6 text-gray-600" />
                      <span className="text-sm text-gray-600">Select a photo</span>
                    </span>
                  )}
                </Label>
              </div>
            </div>

            {/* Existing form fields */}
            {categories.map(category => (
              <div key={category.name}>
                <Label htmlFor={category.name}>{category.name}</Label>
                <div className="flex items-center">
                  {React.createElement(category.icon, { className: "mr-2" })}
                  <Input
                    id={category.name}
                    placeholder={`Enter your ${category.name.toLowerCase()} habits`}
                    value={habits[category.name] || ''}
                    onChange={(e) => handleInputChange(category.name, e.target.value)}
                  />
                </div>
              </div>
            ))}

            {/* Existing submit button */}
            <Button 
              className="w-full" 
              onClick={(e) => {
                e.preventDefault()
                console.log("Generating recommendations")
                generateRecommendations()
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Recommendations
                </>
              ) : (
                <>
                  Get AI Recommendations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}