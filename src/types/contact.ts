// src/types/contact.ts

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  status: 'Active' | 'Inactive';
  createdDate: string;
  avatar?: string;
}

// Adding an empty default export guarantees the bundler treats this as a valid ES module
export default {};