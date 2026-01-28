'use client'

import { useState } from 'react'
import { CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuizQuestion as QuizQuestionType } from '@/lib/types'

interface QuizQuestionProps {
  question: QuizQuestionType
  onAnswer: (answerIndex: number) => void
  selectedAnswer?: number
  showCorrect?: boolean
}

export function QuizQuestion({ 
  question, 
  onAnswer, 
  selectedAnswer,
  showCorrect = false 
}: QuizQuestionProps) {
  const [hoveredOption, setHoveredOption] = useState<number | null>(null)
  const hasAnswered = selectedAnswer !== undefined

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium leading-relaxed">
        {question.question}
      </h3>
      
      <div className="space-y-2">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index
          const isCorrect = index === question.correctAnswerIndex
          const showAsCorrect = showCorrect && isCorrect
          const showAsWrong = showCorrect && isSelected && !isCorrect
          
          return (
            <button
              key={index}
              onClick={() => !hasAnswered && onAnswer(index)}
              onMouseEnter={() => !hasAnswered && setHoveredOption(index)}
              onMouseLeave={() => setHoveredOption(null)}
              disabled={hasAnswered}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-all duration-200",
                "flex items-center gap-3",
                !hasAnswered && "hover:border-primary hover:bg-primary/5 cursor-pointer",
                !hasAnswered && hoveredOption === index && "border-primary bg-primary/5",
                hasAnswered && !isSelected && !showAsCorrect && "opacity-50",
                isSelected && !showCorrect && "border-primary bg-primary/10",
                showAsCorrect && "border-green-500 bg-green-500/10",
                showAsWrong && "border-red-500 bg-red-500/10",
                hasAnswered && "cursor-default"
              )}
            >
              <div 
                className={cn(
                  "flex-shrink-0 size-6 rounded-full border-2 flex items-center justify-center text-xs font-medium",
                  !hasAnswered && "border-muted-foreground/40 text-muted-foreground",
                  !hasAnswered && hoveredOption === index && "border-primary text-primary",
                  isSelected && !showCorrect && "border-primary bg-primary text-primary-foreground",
                  showAsCorrect && "border-green-500 bg-green-500 text-white",
                  showAsWrong && "border-red-500 bg-red-500 text-white"
                )}
              >
                {(showAsCorrect || (isSelected && !showCorrect)) ? (
                  <CheckIcon className="size-3.5" />
                ) : (
                  String.fromCharCode(65 + index)
                )}
              </div>
              <span className={cn(
                "flex-1",
                showAsCorrect && "font-medium text-green-700 dark:text-green-400",
                showAsWrong && "font-medium text-red-700 dark:text-red-400"
              )}>
                {option}
              </span>
            </button>
          )
        })}
      </div>

      {showCorrect && question.explanation && (
        <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
          <p className="text-sm font-medium mb-1">Explanation</p>
          <p className="text-sm text-muted-foreground">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
