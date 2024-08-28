import ManualReceiptForm from "@/components/shared/manualreceiptform";


export default function ReceptHomePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-start">
            <h1>Receipt Home Page</h1>

            <ManualReceiptForm />
        </div>
    )
}