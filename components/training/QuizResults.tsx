'use client'

import { 
  CheckCircle2Icon, 
  XCircleIcon, 
  RotateCcwIcon,
  TrophyIcon,
  ArrowRightIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Quiz, QuizAttempt } from '@/lib/types'

interface QuizResultsProps {
  attempt: QuizAttempt
  quiz: Quiz
  onRetry: () => void
  onContinue?: () => void
}

export function QuizResults({ attempt, quiz, onRetry, onContinue }: QuizResultsProps) {
  const correctCount = attempt.answers.filter(
    (answer, idx) => answer === quiz.questions[idx].correctAnswerIndex
  ).length
  const incorrectCount = quiz.questions.length - correctCount
  
  return (
    <Card className={cn(
      "border-2",
      attempt.passed ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"
    )}>
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3">
          {attempt.passed ? (
            <div className="p-4 rounded-full bg-green-500/20">
              <TrophyIcon className="size-10 text-green-500" />
            </div>
          ) : (
            <div className="p-4 rounded-full bg-amber-500/20">
              <RotateCcwIcon className="size-10 text-amber-500" />
            </div>
          )}
        </div>
        <CardTitle className="text-xl">
          {attempt.passed ? 'Congratulations! 🎉' : 'Almost There!'}
        </CardTitle>
        <p className="text-muted-foreground">
          {attempt.passed 
            ? 'You passed the quiz and can continue to the next section.'
            : `You need ${quiz.passingScore}% to pass. Try again!`
          }
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Score Display */}
        <div className="text-center">
          <div className="text-5xl font-bold mb-2">
            <span className={attempt.passed ? "text-green-500" : "text-amber-500"}>
              {attempt.score}%
            </span>
          </div>
          <Progress 
            value={attempt.score} 
            className={cn(
              "h-3",
              attempt.passed ? "[&>div]:bg-green-500" : "[&>div]:bg-amber-500"
            )}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Passing score: {quiz.passingScore}%
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle2Icon className="size-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Correct</p>
              <p className="font-semibold">{correctCount} / {quiz.questions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <XCircleIcon className="size-5 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Incorrect</p>
              <p className="font-semibold">{incorrectCount} / {quiz.questions.length}</p>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Question Review</h4>
          <div className="space-y-2">
            {quiz.questions.map((question, idx) => {
              const userAnswer = attempt.answers[idx]
              const isCorrect = userAnswer === question.correctAnswerIndex
              
              return (
                <div 
                  key={question.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border",
                    isCorrect 
                      ? "bg-green-500/5 border-green-500/20" 
                      : "bg-red-500/5 border-red-500/20"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isCorrect ? (
                      <CheckCircle2Icon className="size-4 text-green-500" />
                    ) : (
                      <XCircleIcon className="size-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{question.question}</p>
                    {!isCorrect && (
                      <div className="mt-1 text-xs">
                        <span className="text-red-500">
                          Your answer: {question.options[userAnswer]}
                        </span>
                        <br />
                        <span className="text-green-600">
                          Correct: {question.options[question.correctAnswerIndex]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onRetry}
          >
            <RotateCcwIcon className="size-4 mr-2" />
            {attempt.passed ? 'Retake Quiz' : 'Try Again'}
          </Button>
          {attempt.passed && onContinue && (
            <Button className="flex-1" onClick={onContinue}>
              Continue
              <ArrowRightIcon className="size-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
