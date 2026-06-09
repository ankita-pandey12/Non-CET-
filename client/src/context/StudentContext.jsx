import { createContext, useContext, useReducer } from 'react';

const initialState = {
  board: '',
  stream: '',
  subjects: '',
  marksObtained: '',
  totalMarks: '',
  percentage: '',
  category: '',
  course: '',
  examType: '',
  examScore: '',
};

const StudentContext = createContext();

function studentReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'UPDATE_MANY':
      return { ...state, ...action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function StudentProvider({ children }) {
  const [state, dispatch] = useReducer(studentReducer, initialState);

  const updateField = (field, value) =>
    dispatch({ type: 'UPDATE_FIELD', field, value });

  const updateMany = (payload) =>
    dispatch({ type: 'UPDATE_MANY', payload });

  const reset = () => dispatch({ type: 'RESET' });

  return (
    <StudentContext.Provider value={{ data: state, updateField, updateMany, reset }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudent must be used within StudentProvider');
  return ctx;
}
