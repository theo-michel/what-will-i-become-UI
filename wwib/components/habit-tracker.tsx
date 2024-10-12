"use client"

import { ForwardRefExoticComponent, RefAttributes, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Moon, Utensils, Heart, Book, Video, LucideProps } from "lucide-react"

interface Recommendation {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  text: string;
}

export function HabitTrackerComponent() {
  const [habits, setHabits] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isSimulating, setIsSimulating] = useState(false)

  const generateRecommendations = () => {
    // This is a mock AI recommendation generator
    // In a real application, this would call an AI service
    const mockRecommendations = [
      { icon: Sun, text: "Start your day earlier to increase productivity" },
      { icon: Moon, text: "Establish a consistent sleep schedule" },
      { icon: Utensils, text: "Incorporate more vegetables into your diet" },
      { icon: Heart, text: "Include 30 minutes of exercise in your daily routine" },
      { icon: Book, text: "Dedicate 15 minutes to reading before bed" },
    ]
    setRecommendations(mockRecommendations)
    setCurrentStep(2)
  }

  const startSimulation = () => {
    setIsSimulating(true)
    setCurrentStep(3)
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Describe Your Daily Habits</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your daily habits here..."
              value={habits}
              onChange={(e) => setHabits(e.target.value)}
              className="min-h-[200px]"
            />
            <Button onClick={generateRecommendations} className="mt-4 w-full">
              Get Recommendations
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <rec.icon className="h-6 w-6 text-blue-500" />
                  <span>{rec.text}</span>
                </li>
              ))}
            </ul>
            <Button onClick={startSimulation} className="mt-6 w-full">
              Simulate
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Life Simulation</CardTitle>
          </CardHeader>
          <CardContent>
            {isSimulating ? (
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <Video className="h-12 w-12 text-gray-400" />
                <span className="ml-2 text-gray-600">Simulating your improved life...</span>
              </div>
            ) : (
              <p>Click the button to start the simulation.</p>
            )}
            <Button onClick={() => setCurrentStep(1)} className="mt-4 w-full">
              Start Over
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
