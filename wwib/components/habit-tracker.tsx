'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Heart, Brain, Dumbbell, Book, Users, ArrowRight, Moon, Cigarette, Target, Smile, Droplet, Wine, Smartphone, Utensils } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import React from 'react'
import Image from 'next/image'
import finalPixelImage from '@/assets/final_pixel.png'

// Server URL constant
export const SERVER_URL = 'https://3c61-91-167-190-195.ngrok-free.app/';

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
const CACTUS_WIDTH = 20;
const CACTUS_HEIGHT = 40;
const JUMP_HEIGHT = 100;

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
  const [gameOver, setGameOver] = useState(false);

  const handleInputChange = (category: string, value: string) => {
    setHabits(prev => ({ ...prev, [category]: value }))
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
          user_query: allHabits
        }),
        mode: 'cors',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setRecommendations(data.program);
      console.log('Generated recommendations:', data.program);
      setLoading(false);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // You might want to set an error state here and display it to the user
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
  const fetchGoodImage = async () => {
    try {
      const response = await fetch(SERVER_URL + '/good-image')
      const data = await response.json()
      
      setGoodImage(data.message)
    } catch (error) {
      console.error('Error fetching dog image:', error)
    }
  }
  const fetchBadImage = async () => {
    try {
      const response = await fetch(SERVER_URL + '/bad-image')
      const data = await response.json()
      setBadImage(data.message)
    } catch (error) {
      console.error('Error fetching bad image:', error)
    }
  }

  const jump = useCallback(() => {
    if (!isJumping && !gameOver) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 500);
    }
  }, [isJumping, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  useEffect(() => {
    if (simulating && !showingResults && !gameOver) {
      const gameLoop = setInterval(() => {
        setCactusX((prev) => {
          if (prev <= -CACTUS_WIDTH) {
            setScore((prevScore) => prevScore + 1);
            return GAME_WIDTH;
          }
          return prev - 5;
        });

        setDinoY((prev) => {
          if (isJumping) {
            return Math.max(prev - 10, GAME_HEIGHT - DINO_HEIGHT - JUMP_HEIGHT);
          } else {
            return Math.min(prev + 10, GAME_HEIGHT - DINO_HEIGHT);
          }
        });

        // Collision detection
        if (
          cactusX < DINO_WIDTH &&
          cactusX + CACTUS_WIDTH > 0 &&
          dinoY + DINO_HEIGHT > GAME_HEIGHT - CACTUS_HEIGHT
        ) {
          setGameOver(true);
          clearInterval(gameLoop);
        }
      }, 1000 / 60);

      return () => clearInterval(gameLoop);
    }
  }, [simulating, showingResults, gameOver, cactusX, dinoY, isJumping, score]);

  const restartGame = () => {
    setDinoY(GAME_HEIGHT - DINO_HEIGHT);
    setCactusX(GAME_WIDTH);
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    if (showingResults) {
      fetchDogImage()
      fetchGoodImage()
      fetchBadImage()
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
              <div className="aspect-square bg-gray-200 rounded-lg mb-4">
                <img
                  src={goodImage}
                  alt="Good version of you"
                  className="w-full h-full object-cover rounded-lg"
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
              <div className="aspect-square bg-gray-200 rounded-lg mb-4">
                <img
                  src={badImage}
                  alt="Bad version of you"
                  className="w-full h-full object-cover rounded-lg"
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
                        category: "habits",
                        states: [
                          "I maintain good overall hygiene. I continue to prioritize hydration, drinking plenty of water daily. My sleep schedule remains consistent, sleeping from 10 p.m. to 6 a.m., which allows me to feel quite well-rested.  I now incorporate a short run once a week in addition to my three gym sessions.  I am beginning to incorporate more whole foods into my diet, alongside some processed meals. I've also started practicing short mindfulness exercises a few times a week.  I'm motivated to continue these positive changes.\n",
                          "I maintain good overall hygiene. I prioritize hydration, drinking plenty of water daily. My sleep schedule remains consistent, sleeping from 10 p.m. to 6 a.m., which allows me to feel well-rested. I incorporate a short run once a week in addition to my three gym sessions. I continue to incorporate more whole foods into my diet, alongside some processed meals.  I practice short mindfulness exercises a few times a week. I remain motivated to continue these positive changes.\n"
                        ]
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
        {dogImage && (
          <Card className="mt-8 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Your Motivational Dog</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={dogImage}
                alt="Random dog"
                className="w-full h-auto object-cover rounded-lg"
              />
              <p className="text-center mt-4">Here's a cute dog to motivate you on your journey!</p>
            </CardContent>
          </Card>
        )}
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
          <div className="flex justify-center">
            <div 
              className="bg-white border-2 border-black overflow-hidden cursor-pointer relative" 
              style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
              onClick={jump}
            >
              {/* Dino */}
              <div
                className="absolute"
                style={{
                  width: DINO_WIDTH,
                  height: DINO_HEIGHT,
                  bottom: dinoY - (GAME_HEIGHT - DINO_HEIGHT),
                  left: 20,
                }}
              >
                <DinoSprite isJumping={isJumping} />
              </div>

              {/* Cactus */}
              <div
                className="absolute bg-green-700"
                style={{
                  width: CACTUS_WIDTH,
                  height: CACTUS_HEIGHT,
                  bottom: 0,
                  left: cactusX,
                }}
              />

              {/* Ground */}
              <div className="absolute bottom-0 w-full h-1 bg-black" />

              {/* Score */}
              <div className="absolute top-2 right-2 text-xl font-bold">
                Score: {score}
              </div>

              {/* Game Over Screen */}
              {gameOver && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center">
                  <h2 className="text-3xl font-bold mb-4">Game Over</h2>
                  <p className="text-xl mb-4">Final Score: {score}</p>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={restartGame}
                  >
                    Restart
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm" aria-live="polite">
              Score: {score}
            </p>
            <p className="text-sm mt-2" aria-live="polite">
              {gameOver ? 'Game Over!' : 'Jump with spacebar or click'}
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
            <Button 
              className="w-full" 
              onClick={(e) => {
                e.preventDefault(); // Prevent form submission
                console.log("Generating recommendations");
                generateRecommendations();
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