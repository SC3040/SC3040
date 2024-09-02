"use client";

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react"
import Link from "next/link";

const Hero = () => {
    return (
        <div className="flex flex-col min-h-screen pt-20 md:pt-40 relative overflow-hidden">
            <motion.h1
                initial={{
                    y: 40,
                    opacity: 0,
                }}
                animate={{
                    y: 0,
                    opacity: 1,
                }}
                transition={{
                    ease: "easeOut",
                    duration: 0.5,
                }}
                className="text-2xl md:text-4xl lg:text-7xl font-semibold max-w-6xl mx-auto text-center mt-6 relative z-10"
            >
                Capture Costs, Cultivate Wealth<br/>Your AI Money Mentor
            </motion.h1>
            <motion.p
                initial={{
                    y: 40,
                    opacity: 0,
                }}
                animate={{
                    y: 0,
                    opacity: 1,
                }}
                transition={{
                    ease: "easeOut",
                    duration: 0.5,
                    delay: 0.2,
                }}
                className="text-center mt-6 text-base md:text-xl text-muted-dark max-w-3xl mx-auto relative z-10"
            >
                    In a world of digital spending, make every receipt count. Our app turns your camera into a financial crystal ball. Snap a pic, and let our AI crunch the numbers, revealing spending trends, savings opportunities, and budget insights.
            </motion.p>
            <motion.div
                initial={{
                    y: 80,
                    opacity: 0,
                }}
                animate={{
                    y: 0,
                    opacity: 1,
                }}
                transition={{
                    ease: "easeOut",
                    duration: 0.5,
                    delay: 0.4,
                }}
                className="flex items-center gap-4 justify-center mt-6 relative z-10"
            >
                <Link href="/transactions" passHref>
                    <Button
                        variant="outline"
                        className="flex space-x-2 items-center group"
                    >
                        <span>Get Started</span>
                        <ArrowRight />
                    </Button>
                </Link>
            </motion.div>

        </div>
    );
};

export default Hero;