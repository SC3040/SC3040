import Link from "next/link";

export default function ReceptHomePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-start">
            <h1>Receipt Home Page</h1>

            <div>
                <Link href="/receipt/image">Upload Receipt Image</Link>
                <Link href="/receipt/custom">Enter Receipt Details</Link>
            </div>

        </div>
    )
}