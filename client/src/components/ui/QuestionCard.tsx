import { Link } from 'react-router-dom';
import type { Question } from '../../types';

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Link to={`/questions/${question.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
        {/* Header */}
        <div className="flex items-start gap-2 mb-2">
          <span className="text-blue-500 text-lg mt-0.5">❓</span>
          <h2 className="font-semibold text-gray-800 text-lg leading-tight line-clamp-2">
            {question.title}
          </h2>
        </div>

        {/* Content preview */}
        <p className="text-gray-500 text-sm line-clamp-3 mb-4 ml-7">
          {question.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 ml-7">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
              <span
                className="text-purple-600 font-semibold"
                style={{ fontSize: 9 }}
              >
                {question.author?.username[0].toUpperCase()}
              </span>
            </div>
            <span>{question.author?.username}</span>
          </div>

          <div className="flex items-center gap-3">
            <span>❤️ {question._count?.likes ?? 0}</span>
            <span>💬 {question._count?.comments ?? 0}</span>
            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
