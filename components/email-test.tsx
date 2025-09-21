"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmailTest() {
  const [subject, setSubject] = useState("Test Email from Barber Shop");
  const [message, setMessage] = useState("This is a test email to verify the email system is working correctly.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [barberEmails, setBarberEmails] = useState<string[]>([]);

  // Get all barber emails
  const getBarberEmails = async () => {
    try {
      const response = await fetch("/api/email/barbers");
      const data = await response.json();
      
      if (response.ok) {
        setBarberEmails(data.barberEmails);
        setResult(`Found ${data.count} active barbers`);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  // Send test email to all barbers
  const sendTestEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      setResult("Please fill in both subject and message");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/email/barbers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, message }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`Success: ${data.message}`);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Email System Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Email Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Email Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter email message"
            rows={4}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={getBarberEmails} variant="outline">
            Get Barber Emails
          </Button>
          <Button onClick={sendTestEmail} disabled={loading}>
            {loading ? "Sending..." : "Send Test Email"}
          </Button>
        </div>

        {result && (
          <div className="p-3 bg-gray-100 rounded-md">
            <p className="text-sm">{result}</p>
          </div>
        )}

        {barberEmails.length > 0 && (
          <div className="space-y-2">
            <Label>Active Barber Emails ({barberEmails.length})</Label>
            <div className="p-3 bg-blue-50 rounded-md">
              {barberEmails.map((email, index) => (
                <p key={index} className="text-sm text-blue-700">
                  {email}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Make sure you have set up your environment variables</p>
          <p>• Check the EMAIL_SETUP.md file for configuration instructions</p>
          <p>• This will send emails to ALL active barbers in the system</p>
        </div>
      </CardContent>
    </Card>
  );
}
