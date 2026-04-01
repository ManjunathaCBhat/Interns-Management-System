import React from 'react';
import { Clock, CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const PendingApproval: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0E47] via-[#272757] to-[#0F0E47] flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center border-b bg-gradient-to-r from-[#0F0E47]/5 to-[#272757]/5 space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#8686AC] to-[#505081] rounded-full flex items-center justify-center animate-pulse">
            <Clock className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#0F0E47]">
            Pending Admin Approval
          </CardTitle>
          <CardDescription className="text-base">
            Your profile is under review
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8 pb-8 space-y-6">
          <div className="text-center space-y-4">
            <p className="text-[#505081] leading-relaxed">
              Thank you for completing your profile! Your account has been submitted for approval
              by an administrator.
            </p>

            <div className="bg-gradient-to-r from-[#8686AC]/10 to-[#505081]/10 border-l-4 border-[#505081] p-4 rounded-r-lg text-left space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-[#505081] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[#0F0E47] text-sm">What happens next?</p>
                  <p className="text-sm text-[#505081] mt-1">
                    An administrator will review your profile and approve your access.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[#505081] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[#0F0E47] text-sm">Email notification</p>
                  <p className="text-sm text-[#505081] mt-1">
                    You'll receive an email once your account is approved.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-[#505081] pt-4">
              Please check your email regularly for approval updates.
            </p>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="w-full border-2 border-[#505081] text-[#505081] hover:bg-[#505081] hover:text-white transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;
