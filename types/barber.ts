export interface Barber {
  id: string;
  _id: string; // always the unique identifier
  name: string;
  email: string;
  phone: string;
  image?: string;
  position: string;
  experience: number; // years of experience
  status: "active" | "inactive";
  role?: string; // Add role field for socket updates
}
