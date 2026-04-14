export const Button = ({ children, onClick }: any) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
    >
      {children}
    </button>
  );
};

export const Card = ({ children }: any) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      {children}
    </div>
  );
};
