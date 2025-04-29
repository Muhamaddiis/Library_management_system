export const getUserFromToken = async () => {
  try {
    const res = await fetch("http://localhost:8000/me", {
      credentials: "include", 
    });

    if (!res.ok) {
      throw new Error("Unauthorized");
    }

    return await res.json();
  } catch (err) {
    console.error("getUserFromToken error:", err);
    return null;
  }
};
