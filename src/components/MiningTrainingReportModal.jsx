import React from 'react';
import { X, ThumbsUp, ThumbsDown, Clock, AlertTriangle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export function MiningTrainingReportModal({ isOpen, onClose, scenario }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="modal-content max-h-[90vh] w-full max-w-6xl bg-white rounded-xl shadow-lg relative overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-4xl"
        >
          ×
        </button>

        <div className="p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Analysis <span className="text-gray-600">| {scenario?.title}</span></h2>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">Sales Negotiation Simulation</h3>
              <p className="text-gray-600">Scenario: {scenario?.title}</p>
              <p className="text-gray-600">Task: {scenario?.task || 'B2B Sales Training'}</p>
              <p className="text-gray-600 mb-2">{scenario?.completedDate}</p>
              <p className="text-red-600">Need to improve on Opening Position and Negotiation Skills</p>
            </div>
            <div className="p-6 bg-lime-200 rounded-lg text-center">
              <h4 className="text-gray-700 font-medium">Performance Score</h4>
              <p className="text-2xl font-bold text-gray-800">{scenario?.score}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="col-span-3 p-4 bg-white shadow rounded-lg">
              <h3 className="text-lg font-bold">AI Trainer Feedback</h3>
              <div className="space-y-4 mt-4">
                {/* Opening Position */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Opening Position</h4>
                    <span className="text-gray-600">65%</span>
                  </div>
                  <Progress value={65} className="h-2.5" />
                  <p className="text-sm text-gray-600 mt-1">
                    Tip: You could have highlighted the impact on maintenance schedule and production costs
                  </p>
                </div>

                {/* Trading Variables */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Trading Variables</h4>
                    <span className="text-gray-600">75%</span>
                  </div>
                  <Progress value={75} className="h-2.5" />
                  <p className="text-sm text-gray-600 mt-1">
                    Tip: You traded variables well except for the credit period, where you readily agreed without negotiating
                  </p>
                </div>

                {/* Objection Handling */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Objection Handling</h4>
                    <span className="text-gray-600">90%</span>
                  </div>
                  <Progress value={90} className="h-2.5" />
                  <p className="text-sm text-gray-600 mt-1">
                    Tip: You did an excellent job of handling objections and making your case
                  </p>
                </div>

                {/* Negotiation Outcomes */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Negotiation Outcomes</h4>
                    <span className="text-gray-600">50%</span>
                  </div>
                  <Progress value={50} className="h-2.5" />
                  <p className="text-sm text-gray-600 mt-1">
                    Tip: You could have extracted better price & credit terms, especially that the major concerns of the customer were addressed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Style Breakdown Section */}
          <div className="mt-6 p-6 bg-gray-50 rounded-lg shadow-lg relative">
            <h3 className="text-lg font-bold">Soft Skills</h3>
            <p className="text-gray-700">A breakdown of <strong>how</strong> you handled the conversation </p>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Pace Section */}
              <div className="p-4 bg-white shadow rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-semibold mb-3">Rapport Building</h4>
              </div>
                <p className="text-gray-600">❌ You didn't build rapport with the customer.</p>
              </div>

              {/* Clarity Section */}
              <div className="p-4 bg-white shadow rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-semibold mb-3">Clarity</h4>
                </div>
                <p className="text-gray-600">❌ You didn't speak clearly about what you wanted to say.</p>
              </div>

              {/* Sentence Length Section */}
              <div className="p-4 bg-white shadow rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-semibold mb-3">Empathy</h4>
                </div>
                <p className="text-gray-600">✅ You demonstrated empathy by understanding the customer's concerns and showing that you care about their needs.</p>
              </div>

              {/* Filler Words Section */}
              <div className="p-4 bg-white shadow rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-semibold mb-3">Confidence</h4>
                </div>
                <p className="text-gray-600">✅ You demonstrated confidence by being assertive and clear in your communication.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 