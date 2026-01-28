'use client'

import { useState } from 'react'
import { 
  BrainCircuitIcon, 
  CheckCircle2Icon, 
  XCircleIcon,
  RotateCcwIcon,
  ArrowRightIcon,
  LockIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import { QuizQuestion } from './QuizQuestion'
import { QuizResults } from './QuizResults'
import { useTrainingStore, useUserStore } from '@/lib/data/store'
import type { Quiz, QuizAttempt } from '@/lib/types'

interface QuizCardProps {
  quiz: Quiz
  sectionTitle: string
  isLocked?: boolean
  onComplete?: (passed: boolean) => void
}

export function QuizCard({ quiz, sectionTitle, isLocked = false, onComplete }: QuizCardProps) {
  const { currentUserId } = useUserStore()
  const { submitQuizAttempt, getUserProgress } = useTrainingStore()
  
  const [isStarted, setIsStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null)
  
  const progress = getUserProgress(currentUserId)
  const previousAttempts = progress?.quizAttempts.filter(a => a.quizId === quiz.id) || []
  const bestScore = previousAttempts.length > 0 
    ? Math.max(...previousAttempts.map(a => a.score))
    : null
  const hasPassed = previousAttempts.some(a => a.passed)
  
  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progressPercent = ((currentQuestionIndex) / quiz.questions.length) * 100

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex]
    setAnswers(newAnswers)
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      // Move to next question
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1)
      }, 500)
    } else {
      // Quiz complete - calculate score
      const correctCount = newAnswers.filter(
        (answer, idx) => answer === quiz.questions[idx].correctAnswerIndex
      ).length
      const score = Math.round((correctCount / quiz.questions.length) * 100)
      const passed = score >= quiz.passingScore
      
      const attempt = submitQuizAttempt(currentUserId, {
        quizId: quiz.id,
        sectionId: quiz.sectionId,
        userId: currentUserId,
        answers: newAnswers,
        score,
        passed
      })
      
      setLastAttempt(attempt)
      setShowResults(true)
      onComplete?.(passed)
    }
  }

  const handleRetry = () => {
    setIsStarted(true)
    setCurrentQuestionIndex(0)
    setAnswers([])
    setShowResults(false)
    setLastAttempt(null)
  }

  const handleStartQuiz = () => {
    setIsStarted(true)
    setCurrentQuestionIndex(0)
    setAnswers([])
  }

  if (isLocked) {
    return (
      <Card className="border-dashed opacity-60">
        <CardContent className="py-8 text-center">
          <LockIcon className="size-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium text-muted-foreground">Quiz Locked</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete the previous section to unlock this quiz
          </p>
        </CardContent>
      </Card>
    )
  }

  if (showResults && lastAttempt) {
    return (
      <QuizResults
        attempt={lastAttempt}
        quiz={quiz}
        onRetry={handleRetry}
      />
    )
  }

  if (!isStarted) {
    return (
      <Card className="border-chart-1/30 bg-chart-1/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-1/20">
                <BrainCircuitIcon className="size-5 text-chart-1" />
              </div>
              <div>
                <CardTitle className="text-base">Section Quiz</CardTitle>
                <CardDescription>{sectionTitle}</CardDescription>
              </div>
            </div>
            {hasPassed && (
              <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                <CheckCircle2Icon className="size-3 mr-1" />
                Passed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {quiz.questions.length} questions • {quiz.passingScore}% to pass
            </span>
            {bestScore !== null && (
              <span className="text-muted-foreground">
                Best score: <span className="font-medium text-foreground">{bestScore}%</span>
              </span>
            )}
          </div>
          
          {previousAttempts.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {previousAttempts.length} previous attempt{previousAttempts.length !== 1 ? 's' : ''}
            </p>
          )}
          
          <Button onClick={handleStartQuiz} className="w-full">
            {hasPassed ? (
              <>
                <RotateCcwIcon className="size-4 mr-2" />
                Retake Quiz
              </>
            ) : previousAttempts.length > 0 ? (
              <>
                <RotateCcwIcon className="size-4 mr-2" />
                Try Again
              </>
            ) : (
              <>
                <ArrowRightIcon className="size-4 mr-2" />
                Start Quiz
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </CardTitle>
          <Badge variant="outline">
            {quiz.passingScore}% to pass
          </Badge>
        </div>
        <Progress value={progressPercent} className="h-1.5 mt-2" />
      </CardHeader>
      <CardContent>
        <QuizQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
          selectedAnswer={answers[currentQuestionIndex]}
        />
      </CardContent>
    </Card>
  )
}
