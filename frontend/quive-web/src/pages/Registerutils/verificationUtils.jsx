export const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
};

export const sendEmailFake = async (email, code) => {
  console.log(`Código ${code} enviado a ${email}`);
  return new Promise((resolve) => setTimeout(resolve, 1000)); // Simulación
};