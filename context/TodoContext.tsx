"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { useWallet } from "./WalletContext";
import { Todo, TodoContract } from "../types";

interface TodoContextProps {
  todos: Todo[];
  loading: boolean;
  error: string;
  transactionPending: boolean;
  createTodo: (content: string) => Promise<boolean>;
  editTodo: (id: number, content: string) => Promise<boolean>;
  completeTodo: (id: number) => Promise<boolean>;
  deleteTodo: (id: number) => Promise<boolean>;
  refreshTodos: () => Promise<void>;
}

const TodoContext = createContext<TodoContextProps>({
  todos: [],
  loading: false,
  error: "",
  transactionPending: false,
  createTodo: async () => false,
  editTodo: async () => false,
  completeTodo: async () => false,
  deleteTodo: async () => false,
  refreshTodos: async () => {},
});

const TODO_CONTRACT_ADDRESS = "0x43Ba349846b06e0b8d369b0c5F075758ABe5E982";
const TODO_CONTRACT_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
    name: "completeTodo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "content", type: "string" }],
    name: "createTodo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
    name: "deleteTodo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_id", type: "uint256" },
      { internalType: "string", name: "newTitle", type: "string" },
    ],
    name: "editTodo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "id", type: "uint256" },
    ],
    name: "TodoCompleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "id", type: "uint256" },
      {
        indexed: false,
        internalType: "string",
        name: "content",
        type: "string",
      },
    ],
    name: "TodoCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "id", type: "uint256" },
    ],
    name: "TodoDeleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "id", type: "uint256" },
      {
        indexed: false,
        internalType: "string",
        name: "newContent",
        type: "string",
      },
    ],
    name: "TodoUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "getTodo",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "string", name: "content", type: "string" },
          { internalType: "bool", name: "completed", type: "bool" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "uint256", name: "updatedAt", type: "uint256" },
        ],
        internalType: "struct TodoList.Todo[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

interface TodoProviderProps {
  children: ReactNode;
}

export function TodoProvider({ children }: TodoProviderProps) {
  const { signer, isConnected } = useWallet();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [transactionPending, setTransactionPending] = useState<boolean>(false);
  const [contract, setContract] = useState<TodoContract | null>(null);

  // Initialize contract whenever the signer changes
  useEffect(() => {
    if (signer) {
      const todoContract = new ethers.Contract(
        TODO_CONTRACT_ADDRESS,
        TODO_CONTRACT_ABI,
        signer
      ) as unknown as TodoContract;
      setContract(todoContract);
    } else {
      setContract(null);
    }
  }, [signer]);

  // Fetch todos when the contract is ready
  useEffect(() => {
    if (contract && isConnected) {
      fetchTodos();
    } else {
      setTodos([]);
    }
  }, [contract, isConnected]);

  const fetchTodos = async (): Promise<void> => {
    if (!contract) return;

    setLoading(true);
    setError("");

    try {
      const todoList = await contract.getTodo();
      setTodos(
        todoList.map((todo) => ({
          id: todo.id.toNumber(),
          content: todo.content,
          completed: todo.completed,
          createdAt: new Date(todo.createdAt.toNumber() * 1000),
          updatedAt: new Date(todo.updatedAt.toNumber() * 1000),
        }))
      );
    } catch (err) {
      console.error("Error fetching todos:", err);
      setError("Failed to fetch todo list");
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (content: string): Promise<boolean> => {
    if (!contract) return false;

    setTransactionPending(true);
    setError("");

    try {
      const tx = await contract.createTodo(content);
      await tx.wait();
      await fetchTodos();
      return true;
    } catch (err: any) {
      console.error("Error creating todo:", err);
      setError(
        "Transaction failed: " + (err.reason || err.message || "Unknown error")
      );
      return false;
    } finally {
      setTransactionPending(false);
    }
  };

  const editTodo = async (id: number, content: string): Promise<boolean> => {
    if (!contract) return false;

    setTransactionPending(true);
    setError("");

    try {
      const tx = await contract.editTodo(id, content);
      await tx.wait();
      await fetchTodos();
      return true;
    } catch (err: any) {
      console.error("Error editing todo:", err);
      setError(
        "Transaction failed: " + (err.reason || err.message || "Unknown error")
      );
      return false;
    } finally {
      setTransactionPending(false);
    }
  };

  const completeTodo = async (id: number): Promise<boolean> => {
    if (!contract) return false;

    setTransactionPending(true);
    setError("");

    try {
      const tx = await contract.completeTodo(id);
      await tx.wait();
      await fetchTodos();
      return true;
    } catch (err: any) {
      console.error("Error completing todo:", err);
      setError(
        "Transaction failed: " + (err.reason || err.message || "Unknown error")
      );
      return false;
    } finally {
      setTransactionPending(false);
    }
  };

  const deleteTodo = async (id: number): Promise<boolean> => {
    if (!contract) return false;

    setTransactionPending(true);
    setError("");

    try {
      const tx = await contract.deleteTodo(id);
      await tx.wait();
      await fetchTodos();
      return true;
    } catch (err: any) {
      console.error("Error deleting todo:", err);
      setError(
        "Transaction failed: " + (err.reason || err.message || "Unknown error")
      );
      return false;
    } finally {
      setTransactionPending(false);
    }
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        loading,
        error,
        transactionPending,
        createTodo,
        editTodo,
        completeTodo,
        deleteTodo,
        refreshTodos: fetchTodos,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodo() {
  return useContext(TodoContext);
}
