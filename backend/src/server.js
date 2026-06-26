import app from "./app.js";

const PORT = process.env.PORT || 3000;

console.log("DATABASE_URL:", process.env.DATABASE_URL); // 👈 agrega esto

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${PORT}`);
});