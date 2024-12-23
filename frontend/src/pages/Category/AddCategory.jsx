import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddCategory = () => {
    const [name, setName] = useState('');
    const [description, setDes] = useState('');
    const navigate = useNavigate();

    const handleAddCategory = () => {
        const data = { name, description };
        axios
            .post("http://localhost:8080/category/add", data)
            .then(() => {
                navigate('/category');
            })
            .catch((err) => {
                console.error(err);
                alert("An error occurred when adding a category");
            })
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 py-12 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Add Category</h2>
            <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Description</label>
                <input
                    type='text'
                    value={description}
                    onChange={(e) => setDes(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <button
                onClick={handleAddCategory}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
                Save
            </button>
        </div>
        </div>
    )
}

export default AddCategory