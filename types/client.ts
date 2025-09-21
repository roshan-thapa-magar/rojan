export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  ageGroup: "child" | "student" | "young-man" | "adult" | "old-man";
  customerType: "regular" | "vip" | "new";
  address: string;
}
