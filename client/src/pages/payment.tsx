import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Smartphone, AlertCircle, Loader2 } from "lucide-react";
import logo from "@assets/generated_images/a_modern_typographic_logo_for_mpocket_with_a_wallet_motif_in_the_letter_'m'..png";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PaymentData {
  amount: number;
  vpa: string;
  merchantName: string;
  status: string;
}

export default function PaymentPage() {
  const [location] = useLocation();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const paymentId = searchParams.get("id");

      if (!paymentId) {
        setError("No payment ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/payments/${paymentId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || "Failed to load payment details");
          setLoading(false);
          return;
        }

        const data = await response.json();
        setPaymentData(data);
      } catch (err) {
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();

    const checkMobile = () => {
      setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handlePayment = (link: string) => {
    window.location.href = link;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-8 px-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="mt-4 text-slate-600">Loading payment details...</p>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-8 px-4">
        <Alert className="max-w-md bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Payment Error</AlertTitle>
          <AlertDescription className="text-red-700">
            {error || "Unable to load payment details. Please contact the merchant for a valid payment link."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const upiLink = `upi://pay?pa=${paymentData.vpa}&pn=${encodeURIComponent(
    paymentData.merchantName
  )}&am=${paymentData.amount}&cu=INR`;

  const gpayLink = `tez://upi/pay?pa=${paymentData.vpa}&pn=${encodeURIComponent(
    paymentData.merchantName
  )}&am=${paymentData.amount}&cu=INR`;
  const phonepeLink = `phonepe://pay?pa=${paymentData.vpa}&pn=${encodeURIComponent(
    paymentData.merchantName
  )}&am=${paymentData.amount}&cu=INR`;
  const paytmLink = `paytmmp://pay?pa=${paymentData.vpa}&pn=${encodeURIComponent(
    paymentData.merchantName
  )}&am=${paymentData.amount}&cu=INR`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 font-sans text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col items-center space-y-6"
      >
        {/* Header / Logo */}
        <div className="flex items-center space-x-2 mb-4">
          <img
            src={logo}
            alt="SecurePay Logo"
            className="w-12 h-12 rounded-xl shadow-sm"
          />
          <span className="text-2xl font-bold tracking-tight text-slate-800">
            mPocket
          </span>
        </div>

        {/* Main Payment Card */}
        <Card className="w-full shadow-xl border-0 bg-white overflow-hidden rounded-2xl">
          <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />
          <CardHeader className="text-center pb-2 pt-8">
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Paying to
            </span>
            <h2 className="text-xl font-bold text-slate-800 mt-1">
              {paymentData.merchantName}
            </h2>
            <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs mt-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Merchant</span>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col items-center pb-8">
            <div className="my-6 flex items-baseline justify-center text-slate-900">
              <span className="text-3xl font-light mr-1">₹</span>
              <span className="text-5xl font-mono font-bold tracking-tighter">
                {paymentData.amount}
              </span>
            </div>

            <div className="w-full space-y-4">
              {/* Desktop: QR Code */}
              <div className="hidden md:flex flex-col items-center space-y-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
                <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                  <QRCodeSVG
                    value={upiLink}
                    size={180}
                    level={"H"}
                    imageSettings={{
                      src: logo,
                      x: undefined,
                      y: undefined,
                      height: 24,
                      width: 24,
                      excavate: true,
                    }}
                  />
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Scan with any UPI App to pay
                </p>
                <div className="flex space-x-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                  {/* Mock icons for visual cue */}
                  <div className="h-6 w-10 bg-slate-300 rounded" title="GPay"></div>
                  <div className="h-6 w-10 bg-slate-300 rounded" title="PhonePe"></div>
                  <div className="h-6 w-10 bg-slate-300 rounded" title="Paytm"></div>
                  <div className="h-6 w-10 bg-slate-300 rounded" title="BHIM"></div>
                </div>
              </div>

              {/* Mobile: Deep Link Buttons */}
              <div className="md:hidden flex flex-col space-y-3 w-full">
                <Button
                  onClick={() => handlePayment(gpayLink)}
                  className="w-full h-14 text-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-500 relative overflow-hidden group shadow-sm transition-all"
                >
                  <span className="absolute left-0 top-0 h-full w-1.5 bg-blue-500 group-hover:w-2 transition-all" />
                  <span className="flex-1 text-left pl-4 font-semibold">Google Pay</span>
                  <Smartphone className="w-5 h-5 text-slate-400" />
                </Button>

                <Button
                  onClick={() => handlePayment(phonepeLink)}
                  className="w-full h-14 text-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-purple-500 relative overflow-hidden group shadow-sm transition-all"
                >
                  <span className="absolute left-0 top-0 h-full w-1.5 bg-purple-600 group-hover:w-2 transition-all" />
                  <span className="flex-1 text-left pl-4 font-semibold">PhonePe</span>
                  <Smartphone className="w-5 h-5 text-slate-400" />
                </Button>

                <Button
                  onClick={() => handlePayment(paytmLink)}
                  className="w-full h-14 text-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-cyan-500 relative overflow-hidden group shadow-sm transition-all"
                >
                  <span className="absolute left-0 top-0 h-full w-1.5 bg-cyan-500 group-hover:w-2 transition-all" />
                  <span className="flex-1 text-left pl-4 font-semibold">Paytm</span>
                  <Smartphone className="w-5 h-5 text-slate-400" />
                </Button>

                 <Button
                  onClick={() => handlePayment(upiLink)}
                  variant="outline"
                  className="w-full h-12 mt-2 text-slate-500 border-dashed"
                >
                  Other UPI Apps
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50 p-4 flex justify-center border-t border-slate-100">
            <div className="flex items-center text-slate-400 text-xs space-x-1">
              <Lock className="w-3 h-3" />
              <span>Secured by 256-bit encryption</span>
            </div>
          </CardFooter>
        </Card>

        {/* Technical Note Accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="text-xs text-slate-400 justify-center hover:no-underline py-2">
              Developer & Production Notes
            </AccordionTrigger>
            <AccordionContent>
              <Alert className="bg-blue-50 border-blue-100 text-blue-900 mb-4">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle>Server-Controlled Payments</AlertTitle>
                <AlertDescription className="text-xs mt-2 space-y-2">
                  <p>
                    <strong>1. Secure Amount:</strong> Payment amounts are controlled server-side. Users cannot modify the payment amount through URL manipulation.
                  </p>
                  <p>
                    <strong>2. Payment Sessions:</strong> Create a payment session via POST /api/payments/create with amount, vpa, and merchantName. Share the returned payment URL with customers.
                  </p>
                  <p>
                    <strong>3. Webhooks:</strong> For production, integrate with a payment gateway (Razorpay, Cashfree, PayU) to receive payment success webhooks and update session status.
                  </p>
                  <p className="font-mono text-[10px] bg-blue-100/50 p-2 rounded mt-2">
                    Create Payment: POST /api/payments/create {`{ amount: 500, vpa: "merchant@bank", merchantName: "ShopName" }`}
                  </p>
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.div>
    </div>
  );
}
