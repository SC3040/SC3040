"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from '@/hooks/AuthProvider'

export default function SignInPage() {
    const router = useRouter();

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const { toast } = useToast()

    const { signIn, signUp, loading } = useAuth();

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            await signIn(email, password)
            toast({
                title: "Sign in success!",
            })
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

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            await signUp(email, password)
            toast({
                title: "Sign up success!",
            })
            router.push('/home')
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast({
                    title: "Sign up failed!",
                    description: error.message,
                })
            } else {
                toast({
                    title: "Sign up failed!",
                    description: "An unexpected error occurred",
                })
            }
        }
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Welcome to SC3040 !</CardTitle>
                    <CardDescription className="text-center">Sign in to your account or create a new one</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="signin" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="signin" disabled={loading}>Sign In</TabsTrigger>
                            <TabsTrigger value="signup" disabled={loading}>Sign Up</TabsTrigger>
                        </TabsList>
                        <TabsContent value="signin">
                            <form onSubmit={handleSignIn}>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
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
                        </TabsContent>
                        <TabsContent value="signup">
                            <form onSubmit={handleSignUp}>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            placeholder="m@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Password</Label>
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full mt-6" disabled={loading}>
                                    {loading ? "Signing Up..." : "Sign Up"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        By signing in, you agree to our{' '}
                        <a href="#" className="text-primary hover:underline">Terms of Service</a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}