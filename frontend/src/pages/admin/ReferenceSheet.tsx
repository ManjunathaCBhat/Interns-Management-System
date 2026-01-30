import React, { useEffect, useState } from 'react';
import { Table, Select, Input, Button, Tag, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios'; // adjust if your axios instance path differs
import { DownloadOutlined } from '@ant-design/icons';
import { CSVLink } from 'react-csv';

const { Option } = Select;

const performanceOptions = [
  { value: 'not-assessed', label: 'Not Assessed' },
  { value: 'poor', label: 'Poor', color: '#ff4d4f' },
  { value: 'fair', label: 'Fair', color: '#faad14' },
  { value: 'good', label: 'Good', color: '#52c41a' },
  { value: 'excellent', label: 'Excellent', color: '#1890ff' }
];

interface Intern {
  _id: string;
  name: string;
  email: string;
  phone: string;
  referredBy?: string;
  status: string;
  performance: string;
  comments?: string;
}

const ReferenceSheet: React.FC = () => {
  const [data, setData] = useState<Intern[]>([]);
  const [search, setSearch] = useState('');

  const fetchInterns = async () => {
    const res = await axios.get('/api/v1/admin/reference');
    setData(res.data);
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  const updateField = async (id: string, field: string, value: string) => {
    await axios.patch(`/api/v1/admin/reference/${id}`, {
      [field]: value
    });
    fetchInterns();
  };

  const filteredData = data.filter(i =>
    [i.name, i.email, i.phone].some(field =>
      field?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const columns: ColumnsType<Intern> = [
    {
      title: 'Sl. No',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Email',
      dataIndex: 'email'
    },
    {
      title: 'Phone',
      dataIndex: 'phone'
    },
    {
      title: 'Referred By / Comment',
      dataIndex: 'referredBy'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' },
        { text: 'Pending', value: 'Pending' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (value, record) => (
        <Select
          value={value}
          style={{ width: 120 }}
          onChange={(v) => updateField(record._id, 'status', v)}
        >
          <Option value="Active">Active</Option>
          <Option value="Inactive">Inactive</Option>
          <Option value="Pending">Pending</Option>
        </Select>
      )
    },
    {
      title: 'Test / Interview Performance',
      dataIndex: 'performance',
      render: (value, record) => (
        <Select
          value={value}
          style={{ width: 160 }}
          onChange={(v) => updateField(record._id, 'performance', v)}
        >
          {performanceOptions.map(opt => (
            <Option key={opt.value} value={opt.value}>
              <Tag color={opt.color}>{opt.label}</Tag>
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Comments',
      dataIndex: 'comments'
    }
  ];

  return (
    <div>
      <h2>Reference Sheet</h2>

      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search name / email / phone"
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />

        <CSVLink data={filteredData} filename="intern-reference.csv">
          <Button icon={<DownloadOutlined />}>Export CSV</Button>
        </CSVLink>
      </Space>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default ReferenceSheet;
