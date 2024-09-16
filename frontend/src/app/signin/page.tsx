"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from '@/hooks/AuthProvider'
import Link from 'next/link'

export default function SignInPage() {
    const router = useRouter();
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const { toast } = useToast()
    const { signIn, loading } = useAuth();

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            await signIn({username, password})
            toast({ title: "Sign in success!" })
            router.push('/home')
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast({
                    title: "Sign in failed!",
                    description: error.message,
                })
            } else {
                toast({
                    title: "Sign in failed!",
                    description: "An unexpected error occurred",
                })
            }
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-[350px]">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Welcome Back!</CardTitle>
                    <CardDescription className="text-center">Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignIn}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full mt-6" disabled={loading}>
                            {loading ? "Signing In..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col items-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Don{"'"}t have an account?{' '}
                        <Link href="/signup" className="text-primary hover:underline">Sign Up</Link>
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Forgot your password?{' '}
                        <Link href="/forgot-password" className="text-primary hover:underline">Reset Password</Link>
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                        By signing in, you agree to our{' '}
                        <a href="#" className="text-primary hover:underline">Terms of Service</a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}