import apiClient from "@/api/client";

export default async function Testing() {
    const res = await apiClient.get("/api/health");
    return (
        <div>
            <h1>{res.data.message}</h1>
        </div>
    );
}