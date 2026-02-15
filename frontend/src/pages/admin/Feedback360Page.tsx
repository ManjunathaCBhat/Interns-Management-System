import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { feedback360Service, Feedback360, FeedbackEntry } from "@/services/feedback360Service";

const initialEntry: FeedbackEntry = {
  reviewerId: "",
  reviewerName: "",
  reviewerRole: "peer",
  feedbackType: "peer",
  rating: 0,
  comments: "",
};

const Feedback360Page = () => {
  const { internId } = useParams();
  const [feedbacks, setFeedbacks] = useState<Feedback360[]>([]);
  const [entry, setEntry] = useState<FeedbackEntry>(initialEntry);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line
  }, [internId]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      if (internId) {
        const res = await feedback360Service.getFeedback360(internId);
        setFeedbacks(res);
      }
    } catch (e) {
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (internId) {
        const payload: Feedback360 = {
          internId,
          internName: "", // Optionally fetch/display
          feedbacks: [entry],
        };
        await feedback360Service.submitFeedback360(payload);
        setEntry(initialEntry);
        fetchFeedbacks();
      }
    } catch (e) {}
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>360° Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              {feedbacks.length === 0 ? (
                <div>No feedback yet.</div>
              ) : (
                <ul className="mb-6">
                  {feedbacks.map((fb) => (
                    <li key={fb._id} className="mb-4 border-b pb-2">
                      <div className="font-semibold">Feedback Period: {fb.period || "-"}</div>
                      {fb.feedbacks.map((f, idx) => (
                        <div key={idx} className="ml-2 mb-1">
                          <div>Type: {f.feedbackType} | Rating: {f.rating}/10</div>
                          <div>{f.comments}</div>
                          <div className="text-xs text-gray-500">By: {f.reviewerName} ({f.reviewerRole})</div>
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label>Reviewer Name</label>
              <Input name="reviewerName" value={entry.reviewerName} onChange={handleChange} required />
            </div>
            <div>
              <label>Reviewer Role</label>
              <select name="reviewerRole" value={entry.reviewerRole} onChange={handleChange} className="w-full border rounded px-2 py-1">
                <option value="peer">Peer</option>
                <option value="mentor">Mentor</option>
                <option value="self">Self</option>
              </select>
            </div>
            <div>
              <label>Feedback Type</label>
              <select name="feedbackType" value={entry.feedbackType} onChange={handleChange} className="w-full border rounded px-2 py-1">
                <option value="peer">Peer</option>
                <option value="mentor">Mentor</option>
                <option value="self">Self</option>
              </select>
            </div>
            <div>
              <label>Rating</label>
              <Input type="number" name="rating" value={entry.rating} onChange={handleChange} min={0} max={10} required />
            </div>
            <div>
              <label>Comments</label>
              <Textarea name="comments" value={entry.comments} onChange={handleChange} />
            </div>
            <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Feedback"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Feedback360Page;
