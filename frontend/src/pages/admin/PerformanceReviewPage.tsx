import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialReview = {
  technicalSkills: 0,
  communicationSkills: 0,
  punctuality: 0,
  problemSolving: 0,
  teamwork: 0,
  overallRating: 0,
  performanceReview: "",
  continuationDecision: false,
  comments: "",
  reviewType: "Quarterly",
};

const PerformanceReviewPage = () => {
  const { internId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(initialReview);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, [internId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/performance/review", { params: { internId } });
      setReviews(res.data);
    } catch (e) {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post("/admin/performance/review", {
        ...form,
        internId,
        reviewDate: new Date().toISOString().split("T")[0],
        // Add other required fields as needed (internName, email, etc.)
      });
      setForm(initialReview);
      fetchReviews();
    } catch (e) {}
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Performance Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              {reviews.length === 0 ? (
                <div>No reviews yet.</div>
              ) : (
                <ul className="mb-6">
                  {reviews.map((r) => (
                    <li key={r._id} className="mb-4 border-b pb-2">
                      <div className="font-semibold">{r.reviewType} ({r.reviewDate})</div>
                      <div>Overall: {r.overallRating}/10</div>
                      <div>{r.performanceReview}</div>
                      <div className="text-xs text-gray-500">By: {r.reviewedBy}</div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label>Technical Skills</label>
              <Input type="number" name="technicalSkills" value={form.technicalSkills} onChange={handleChange} min={0} max={10} />
            </div>
            <div>
              <label>Communication Skills</label>
              <Input type="number" name="communicationSkills" value={form.communicationSkills} onChange={handleChange} min={0} max={10} />
            </div>
            <div>
              <label>Punctuality</label>
              <Input type="number" name="punctuality" value={form.punctuality} onChange={handleChange} min={0} max={10} />
            </div>
            <div>
              <label>Problem Solving</label>
              <Input type="number" name="problemSolving" value={form.problemSolving} onChange={handleChange} min={0} max={10} />
            </div>
            <div>
              <label>Teamwork</label>
              <Input type="number" name="teamwork" value={form.teamwork} onChange={handleChange} min={0} max={10} />
            </div>
            <div>
              <label>Overall Rating</label>
              <Input type="number" name="overallRating" value={form.overallRating} onChange={handleChange} min={0} max={10} />
            </div>
            <div>
              <label>Review Type</label>
              <Input name="reviewType" value={form.reviewType} onChange={handleChange} />
            </div>
            <div>
              <label>Performance Review</label>
              <Textarea name="performanceReview" value={form.performanceReview} onChange={handleChange} />
            </div>
            <div>
              <label>Continuation Decision</label>
              <Input type="checkbox" name="continuationDecision" checked={form.continuationDecision} onChange={handleChange} /> Continue
            </div>
            <div>
              <label>Comments</label>
              <Textarea name="comments" value={form.comments} onChange={handleChange} />
            </div>
            <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Review"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceReviewPage;
