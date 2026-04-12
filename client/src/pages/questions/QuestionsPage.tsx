import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { questionsApi } from '../../api/questions';
import QuestionCard from '../../components/ui/QuestionCard';

export default function QuestionsPage() {
  const {
    data: questions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['questions'],
    queryFn: () => questionsApi.getAll().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load questions. Please try again.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Questions</h1>
          <p className="text-gray-500 text-sm mt-1">
            {questions?.length ?? 0} questions asked
          </p>
        </div>
        <Link
          to="/questions/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Ask Question
        </Link>
      </div>

      {/* Questions list */}
      {questions?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No questions yet</p>
          <p className="text-gray-400 text-sm mt-1">Be the first to ask!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {questions?.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
}
