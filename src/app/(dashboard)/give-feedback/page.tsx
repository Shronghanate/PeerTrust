import { GiveFeedbackForm } from './form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GiveFeedbackPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Provide Feedback</CardTitle>
          <CardDescription>
            Your feedback is valuable. Please rate your peer's performance across the following criteria and provide specific comments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GiveFeedbackForm />
        </CardContent>
      </Card>
    </div>
  );
}
