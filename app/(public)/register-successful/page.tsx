"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ScaleIn, FadeIn } from "@/components/animations/page-animation";
import { motion } from "framer-motion";

export default function RegisterSuccessful() {
    const router = useRouter();

    const handleLoginRedirect = () => {
        router.push("/");
    };

    return (
        <div className="auth-page flex min-h-dvh w-full items-center justify-center p-4">
            <ScaleIn className="w-full max-w-[500px]">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col items-center space-y-2">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ 
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15,
                                    delay: 0.2
                                }}
                            >
                                <CheckCircle className="h-16 w-16 text-green-500" />
                            </motion.div>
                            <FadeIn delay={0.3}>
                                <CardTitle>Registration Successful</CardTitle>
                                <CardDescription>
                                    Your account has been created successfully
                                </CardDescription>
                            </FadeIn>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center space-y-4">
                            <FadeIn delay={0.4}>
                                <p className="text-center text-muted-foreground">
                                    Thank you for registering. You can now log in with your credentials.
                                </p>
                            </FadeIn>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="w-full"
                            >
                                <Button
                                    className="w-full"
                                    onClick={handleLoginRedirect}
                                >
                                    Go to Login
                                </Button>
                            </motion.div>
                        </div>
                    </CardContent>
                </Card>
            </ScaleIn>
        </div>
    );
} 