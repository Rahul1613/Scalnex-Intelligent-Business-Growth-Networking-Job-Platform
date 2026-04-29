import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import JobPostingPage from './JobPostingPage';
import apiService from '../services/api';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  DollarSign,
  Search,
  Filter,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  status: 'active' | 'inactive';
  hireDate: number;
  createdAt: number;
}

const EmployeesPage: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [activeTab, setActiveTab] = useState<'employees' | 'recruitment'>('employees');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    hireDate: '',
  });

  // Load employees
  useEffect(() => {
    loadEmployees();
  }, [user]);

  const loadEmployees = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiService.getEmployees(user.id);
      if (response.success) {
        setEmployees(response.data || []);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!user?.id) {
      alert('Please log in to add employees');
      return;
    }

    if (!formData.name || !formData.email || !formData.position || !formData.hireDate) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const response = await apiService.addEmployee({
        userId: user.id,
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : 0,
        hireDate: formData.hireDate, // Service/Backend handles string->date conversion
      });

      if (response.success) {
        alert('✅ Employee added successfully!');
        setShowAddModal(false);
        resetForm();
        loadEmployees();
      } else {
        throw new Error(response.error || 'Failed to add employee');
      }
    } catch (error: any) {
      console.error('Error adding employee:', error);
      alert(error.message || 'Failed to add employee. Please try again.');
    }
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;

    try {
      const response = await apiService.updateEmployee(editingEmployee.id, {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : 0,
        status: editingEmployee.status,
      });

      if (response.success) {
        alert('✅ Employee updated successfully!');
        setEditingEmployee(null);
        resetForm();
        loadEmployees();
      } else {
        throw new Error(response.error || 'Failed to update employee');
      }
    } catch (error: any) {
      console.error('Error updating employee:', error);
      alert(error.message || 'Failed to update employee. Please try again.');
    }
  };

  const handleDeleteEmployee = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const response = await apiService.deleteEmployee(id);

      if (response.success) {
        alert('✅ Employee deleted successfully!');
        loadEmployees();
      } else {
        throw new Error(response.error || 'Failed to delete employee');
      }
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      alert(error.message || 'Failed to delete employee. Please try again.');
    }
  };

  const handleEditClick = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      position: employee.position,
      department: employee.department || '',
      salary: employee.salary?.toString() || '',
      hireDate: new Date(employee.hireDate).toISOString().split('T')[0],
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      salary: '',
      hireDate: '',
    });
    setShowAddModal(false);
    setEditingEmployee(null);
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === 'active').length,
    inactive: employees.filter((e) => e.status === 'inactive').length,
    departments: new Set(employees.map((e) => e.department).filter(Boolean)).size,
  };

  const RecruitmentTab = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recruitment & Job Posting</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Post new jobs and find talent for your team.</p>
      </div>
      <div className="recruitment-embed">
        <JobPostingPage />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading employees...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header with Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Team & Recruitment
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your team members and track employee information
            </p>
          </div>

          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'employees'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              Employees
            </button>
            <button
              onClick={() => setActiveTab('recruitment')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'recruitment'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              Recruitment
            </button>
          </div>
        </div>

        {activeTab === 'employees' ? (
          <>
            <div className="flex justify-end mb-8">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Employee
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Employees</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{stats.total}</p>
                  </div>
                  <Users className="w-10 h-10 text-blue-600 dark:text-blue-400 opacity-50" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Active</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">{stats.active}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400 opacity-50" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Inactive</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.inactive}</p>
                  </div>
                  <XCircle className="w-10 h-10 text-gray-600 dark:text-gray-400 opacity-50" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Departments</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">{stats.departments}</p>
                  </div>
                  <Briefcase className="w-10 h-10 text-purple-600 dark:text-purple-400 opacity-50" />
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Employees Grid */}
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No employees found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first employee'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Add Employee
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {employee.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{employee.position}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${employee.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                      >
                        {employee.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                      {employee.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4" />
                          <span>{employee.phone}</span>
                        </div>
                      )}
                      {employee.department && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Briefcase className="w-4 h-4" />
                          <span>{employee.department}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Hired: {new Date(employee.hireDate).toLocaleDateString()}</span>
                      </div>
                      {employee.salary > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <DollarSign className="w-4 h-4" />
                          <span>${employee.salary.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(employee)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <RecruitmentTab />
        )}

        {/* Add/Edit Modal */}
        {(showAddModal || editingEmployee) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Position *
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Engineering"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Salary
                    </label>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="50000"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hire Date *
                    </label>
                    <input
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
                  >
                    {editingEmployee ? 'Update Employee' : 'Add Employee'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployeesPage;
