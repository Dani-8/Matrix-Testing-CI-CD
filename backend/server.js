const express = require('express')
const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
// ============================================
// ============================================

app.get("/", (req, res) => {
    res.send("Hello, This is the Matrix Testing (CI/CD) Server!")
})



// ============================================
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`)
})
