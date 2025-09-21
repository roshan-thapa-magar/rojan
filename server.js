const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Create Socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: dev
        ? ["https://rojan-three.onrender.com", "http://localhost:3001"]
        : process.env.NEXT_PUBLIC_APP_URL,
      methods: ["GET", "POST"],
    },
    path: "/socket.io/",
  });

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Appointment events
    socket.on("appointment:created", (data) => {
      io.emit("appointment:update", data);
    });

    socket.on("appointment:updated", (data) => {
      io.emit("appointment:update", data);
    });

    socket.on("appointment:deleted", (data) => {
      io.emit("appointment:deleted", data);
    });

    // User events
    socket.on("user:created", (data) => {
      io.emit("user:update", data);
    });

    socket.on("user:updated", (data) => {
      io.emit("user:update", data);
    });

    socket.on("user:deleted", (data) => {
      io.emit("user:deleted", data);
    });

    // Service events
    socket.on("service:created", (data) => {
      io.emit("service:update", data);
    });

    socket.on("service:updated", (data) => {
      io.emit("service:update", data);
    });

    socket.on("service:deleted", (data) => {
      io.emit("service:deleted", data);
    });

    // Inventory events
    socket.on("inventory:created", (data) => {
      io.emit("inventory:update", data);
    });

    socket.on("inventory:updated", (data) => {
      io.emit("inventory:update", data);
    });

    socket.on("inventory:deleted", (data) => {
      io.emit("inventory:deleted", data);
    });

    // Sales events
    socket.on("sale:created", (data) => {
      io.emit("sale:update", data);
    });

    socket.on("sale:deleted", (data) => {
      io.emit("sale:deleted", data);
    });

    // Shop events
    socket.on("shop:created", (data) => {
      io.emit("shop:update", data);
    });

    socket.on("shop:updated", (data) => {
      io.emit("shop:update", data);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Make io available globally for API routes
  global.io = io;

  // Start server
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server running on port ${port}`);
  });
});
