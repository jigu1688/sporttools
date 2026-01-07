import { useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Card, Space, Typography, InputNumber, Checkbox } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { addStudent, updateStudent, deleteStudent, updateData } from '../store/dataSlice'
import ImportExport from '../components/ImportExport/ImportExport'
import { parseGradeCode, parseClassCode, generateGradeCode, generateClassCode } from '../utils/codeMapping'
import { parseNationalityCode } from '../utils/nationalityMapping'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const Students = () => {
  const { classes, students } = useSelector(state => state.data)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [filterForm] = Form.useForm()
  const [editingId, setEditingId] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [filters, setFilters] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // 显示添加/编辑弹窗
  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id)
      form.setFieldsValue(record)
    } else {
      setEditingId(null)
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  // 关闭弹窗
  const handleCancel = () => {
    setIsModalVisible(false)
    setEditingId(null)
  }

  // 从身份证号计算年龄的辅助函数
  const calculateAgeFromIdCard = (idCard) => {
    if (!idCard || idCard.length !== 18) {
      return 0;
    }
    
    // 提取出生日期（7-14位：YYYYMMDD）
    const birthYear = idCard.substring(6, 10);
    const birthMonth = idCard.substring(10, 12);
    const birthDay = idCard.substring(12, 14);
    
    // 计算年龄
    const today = new Date();
    const birth = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // 提交表单
  const handleOk = () => {
    form.validateFields()
      .then(values => {
        setLoading(true)
        // 模拟API请求
        setTimeout(() => {
          // 查找班级名称
          const selectedClass = classes.find(cls => cls.id === values.classId)
          // 只存储班级名称，不包含年级信息
          const className = selectedClass ? selectedClass.className : ''
          
          // 从身份证号自动计算年龄
          let studentData = {
            ...values,
            className: className
          };
          
          // 如果有身份证号，自动计算年龄
          if (values.idCard && values.idCard.length === 18) {
            studentData.age = calculateAgeFromIdCard(values.idCard);
          }

          if (editingId) {
            // 编辑学生
            dispatch(updateStudent({
              ...studentData,
              id: editingId
            }))
            message.success('学生信息更新成功')
          } else {
            // 添加学生
            const newStudent = {
              ...studentData,
              id: students.length + 1
            }
            dispatch(addStudent(newStudent))
            message.success('学生添加成功')
          }
          setIsModalVisible(false)
          setLoading(false)
          setEditingId(null)
        }, 500)
      })
      .catch(info => {
        console.log('表单验证失败:', info)
      })
  }

  // 删除学生
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '您确定要删除这个学生吗？',
      onOk: () => {
        setLoading(true)
        // 模拟API请求
        setTimeout(() => {
          dispatch(deleteStudent(id))
          message.success('学生删除成功')
          setLoading(false)
        }, 500)
      }
    })
  }

  // 处理导入完成
  const handleImportComplete = (data, type, extractClasses = false) => {
    if (type === 'import-students' && data) {
      // 处理学生数据导入
      setLoading(true)
      setTimeout(() => {
        try {
          // 从身份证号提取性别、出生日期和年龄的辅助函数
          const extractInfoFromIdCard = (idCard) => {
            if (!idCard || idCard.length !== 18) {
              return { gender: 'female', birthDate: '', age: 0 };
            }
            
            // 提取出生日期（7-14位：YYYYMMDD）
            const birthYear = idCard.substring(6, 10);
            const birthMonth = idCard.substring(10, 12);
            const birthDay = idCard.substring(12, 14);
            const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;
            
            // 提取性别（第17位：奇数=男，偶数=女）
            const genderDigit = parseInt(idCard.substring(16, 17));
            const gender = genderDigit % 2 === 1 ? 'male' : 'female';
            
            // 计算年龄
            const today = new Date();
            const birth = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
              age--;
            }
            
            return { gender, birthDate, age };
          };
          
          // 转换数据格式
          const formattedStudents = data.map((item, index) => {
            // 根据Excel表头调整字段映射
            // 处理年级和班级
            const gradeCode = item['年级编号'] || item['年级'];
            const classCode = item['班级编号'] || item['班级'];
            
            // 解析年级编码为中文名称
            const parsedGrade = parseGradeCode(gradeCode);
            // 解析班级编码为中文名称
            const parsedClass = parseClassCode(classCode, parsedGrade);
            
            // 获取全国学籍号（G+身份证号）
            const studentId = item['学籍号'] || item['全国学籍号'] || '';
            // 提取身份证号（去掉前面的G）
            const idCardFromStudentId = studentId.startsWith('G') ? studentId.substring(1) : studentId;
            // 从身份证号提取性别、出生日期和年龄
            const { gender: autoGender, birthDate: autoBirthDate, age: autoAge } = extractInfoFromIdCard(idCardFromStudentId);
            
            // 优先使用Excel中的性别和出生日期，如果没有则使用自动提取的值
            let gender = 'female';
            if (item['性别'] === '男' || item['性别'] === '1') {
              gender = 'male';
            } else if (item['性别'] === '女' || item['性别'] === '2') {
              gender = 'female';
            } else {
              // 自动提取性别
              gender = autoGender;
            }
            
            const birthDate = item['出生日期'] || autoBirthDate;
            const idCard = item['身份证号'] || idCardFromStudentId;
            // 处理民族字段，使用民族代码
            const nationality = item['民族代码'] || '1'; // 默认汉族
            // 优先使用Excel中的年龄，如果没有则使用自动提取的年龄
            const age = parseInt(item['年龄']) || autoAge;
            
            return {
              id: students.length + index + 1,
              name: item['姓名'],
              gender: gender,
              age: age,
              nationality: nationality,
              grade: parsedGrade,
              className: parsedClass, // 只存储班级名称，不包含年级信息
              classId: classes.find(cls => cls.className === parsedClass)?.id || 0, // 暂时设为0，后面处理
              parsedClass: parsedClass, // 保存解析后的班级名称，用于后续提取班级信息
              birthDate: birthDate,
              idCard: idCard,
              studentId: studentId,
              educationId: item['教育ID'] || '',
              phone: item['电话'] || '',
              address: item['家庭住址'] || item['家庭地址'] || '',
              status: item['状态'] || '在学',
              email: ''
            };
          })

          // 从学生数据中提取班级信息
          let newClasses = [];
          if (extractClasses) {
            // 提取唯一的年级和班级组合
            const classSet = new Set();
            formattedStudents.forEach(student => {
              classSet.add(`${student.grade}|${student.parsedClass}`);
            });

            // 创建新班级
            classSet.forEach(classKey => {
              const [grade, className] = classKey.split('|');
              // 检查班级是否已存在
              const existingClass = classes.find(cls => cls.grade === grade && cls.className === className);
              if (!existingClass) {
                newClasses.push({
                  id: classes.length + newClasses.length + 1,
                  grade: grade,
                  className: className,
                  coach: '',
                  physicalTeacher: '',
                  studentCount: 0,
                  status: 'active'
                });
              }
            });

            // 添加新班级到系统
            if (newClasses.length > 0) {
              dispatch(updateData({ classes: [...classes, ...newClasses] }));
            }
          }

          // 更新学生的classId
          const allClasses = [...classes, ...newClasses];
          const finalStudents = formattedStudents.map(student => {
            const matchedClass = allClasses.find(cls => 
              cls.grade === student.grade && cls.className === student.parsedClass
            );
            return {
              ...student,
              classId: matchedClass ? matchedClass.id : 1,
              className: student.parsedClass, // 只存储班级名称，不包含年级信息
              parsedClass: undefined // 移除临时字段
            };
          });

          // 添加学生数据
          finalStudents.forEach(student => {
            dispatch(addStudent(student))
          })

          // 显示导入结果
          let messageText = `成功导入 ${finalStudents.length} 条学生数据`;
          if (newClasses.length > 0) {
            messageText += `，同时从学生数据中提取并添加了 ${newClasses.length} 个班级`;
          }
          message.success(messageText)
        } catch (error) {
          message.error('数据处理失败：' + error.message)
        }
        setLoading(false)
      }, 500)
    } else if (type === 'import-classes' && data) {
      // 处理班级数据导入
      setLoading(true)
      setTimeout(() => {
        try {
          // 转换数据格式
          const formattedClasses = data.map((item, index) => {
            // 解析年级编码为中文名称
            const parsedGrade = parseGradeCode(item['年级']);
            // 解析班级编码为中文名称
            const parsedClass = parseClassCode(item['班级'], parsedGrade);
            
            return {
              id: classes.length + index + 1,
              grade: parsedGrade,
              className: parsedClass,
              coach: item['班主任'] || '',
              physicalTeacher: item['体育老师'] || '',
              studentCount: 0,
              status: item['状态'] || 'active'
            };
          })

          // 更新班级数据
          dispatch(updateData({ classes: [...classes, ...formattedClasses] }))
          message.success(`成功导入 ${formattedClasses.length} 条班级数据`)
        } catch (error) {
          message.error('数据处理失败：' + error.message)
        }
        setLoading(false)
      }, 500)
    } else if (type === 'export-students') {
      // 处理学生数据导出
      try {
        const headers = [
          { title: '年级编号', key: 'gradeCode' },
          { title: '班级编号', key: 'classCode' },
          { title: '班级名称', key: 'className' },
          { title: '学籍号', key: 'studentId' },
          { title: '民族代码', key: 'nationalityCode' },
          { title: '姓名', key: 'name' },
          { title: '性别', key: 'genderCode' },
          { title: '出生日期', key: 'birthDate' },
          { title: '家庭住址', key: 'address' }
        ]

        // 转换数据格式，按照Excel表格格式生成数据
        const exportData = students.map(student => {
          // 提取年级和班级名称，如"一年级 主校区1班" -> "一年级", "主校区1班"
          const [gradeName, className] = student.className.split(' ');
          // 生成年级编码
          const gradeCode = generateGradeCode(gradeName);
          // 生成班级编码
          const classCode = generateClassCode(className, gradeName);
          
          // 自动填充性别、出生日期和民族代码
          return {
            gradeCode: gradeCode,
            classCode: classCode,
            className: className,
            studentId: student.studentId,
            nationalityCode: student.nationality || '1', // 使用学生的民族代码，默认1
            name: student.name,
            genderCode: student.gender === 'male' ? '1' : '2', // 1=男，2=女，自动填充
            birthDate: student.birthDate, // 自动填充出生日期
            address: student.address
          };
        })

        // 调用xlsx库导出数据
        import('xlsx').then(XLSX => {
          const worksheet = XLSX.utils.json_to_sheet(exportData.map(item => {
            const row = {}
            headers.forEach(header => {
              row[header.title] = item[header.key]
            })
            return row
          }))
          const workbook = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
          XLSX.writeFile(workbook, '学生数据导出.xlsx')
          message.success('学生数据导出成功')
        })
      } catch (error) {
        message.error('数据导出失败：' + error.message)
      }
    } else if (type === 'export-classes') {
      // 处理班级数据导出
      try {
        const headers = [
          { title: '年级', key: 'grade' },
          { title: '班级', key: 'className' },
          { title: '班主任', key: 'coach' },
          { title: '体育老师', key: 'physicalTeacher' },
          { title: '学生人数', key: 'studentCount' },
          { title: '状态', key: 'status' }
        ]

        // 转换数据格式，将中文名称转换为编码
        const exportData = classes.map(item => {
          // 生成年级编码
          const gradeCode = generateGradeCode(item.grade);
          // 生成班级编码
          const classCode = generateClassCode(item.className, item.grade);
          
          return {
            grade: gradeCode,
            className: classCode,
            coach: item.coach,
            physicalTeacher: item.physicalTeacher,
            studentCount: item.studentCount,
            status: item.status
          };
        });

        // 调用xlsx库导出数据
        import('xlsx').then(XLSX => {
          const worksheet = XLSX.utils.json_to_sheet(exportData.map(item => {
            const row = {}
            headers.forEach(header => {
              // 直接使用item的属性，因为我们已经重新构建了数据对象
              row[header.title] = item[header.title]
            })
            return row
          }))
          const workbook = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
          XLSX.writeFile(workbook, '班级数据导出.xlsx')
          message.success('班级数据导出成功')
        })
      } catch (error) {
        message.error('数据导出失败：' + error.message)
      }
    }
  }

  // 过滤学生列表
  const filteredStudents = students.filter(student => {
    // 搜索过滤
    const matchesSearch = 
      student.name.toLowerCase().includes(searchText.toLowerCase()) ||
      student.className.toLowerCase().includes(searchText.toLowerCase()) ||
      student.phone.includes(searchText)
    
    // 高级筛选
    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true
      
      switch (key) {
        case 'grade':
          return student.grade === value
        case 'gender':
          return student.gender === value
        case 'status':
          return student.status === value
        case 'ageRange':
          return student.age >= value[0] && student.age <= value[1]
        case 'classId':
          return student.classId === value
        default:
          return true
      }
    })
    
    return matchesSearch && matchesFilters
  })
  
  // 分页数据
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )
  
  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的学生')
      return
    }
    
    Modal.confirm({
      title: '确认批量删除',
      content: `您确定要删除选中的 ${selectedRowKeys.length} 名学生吗？`,
      onOk: () => {
        setLoading(true)
        // 模拟API请求
        setTimeout(() => {
          selectedRowKeys.forEach(id => {
            dispatch(deleteStudent(id))
          })
          setSelectedRowKeys([])
          message.success(`成功删除 ${selectedRowKeys.length} 名学生`)
          setLoading(false)
        }, 500)
      }
    })
  }

  // 清空所有学生数据
  const handleClearData = () => {
    Modal.confirm({
      title: '确认清空数据',
      content: '您确定要清空所有学生数据吗？此操作不可恢复！',
      okText: '确认清空',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setLoading(true)
        // 模拟API请求
        setTimeout(() => {
          // 清空所有学生数据
          dispatch(updateData({ students: [] }))
          setSelectedRowKeys([])
          message.success('所有学生数据已清空')
          setLoading(false)
        }, 500)
      }
    })
  }
  
  // 处理筛选
  const handleFilter = () => {
    filterForm.validateFields()
      .then(values => {
        const newFilters = { ...values }
        // 处理年龄范围
        if (values.ageRange && values.ageRange.length === 2) {
          newFilters.ageRange = [values.ageRange[0], values.ageRange[1]]
        } else {
          delete newFilters.ageRange
        }
        // 处理空值
        Object.keys(newFilters).forEach(key => {
          if (!newFilters[key]) {
            delete newFilters[key]
          }
        })
        setFilters(newFilters)
        setCurrentPage(1) // 筛选后回到第一页
        setIsFilterModalVisible(false)
        message.success('筛选条件已应用')
      })
      .catch(info => {
        console.log('筛选验证失败:', info)
      })
  }
  
  // 重置筛选
  const handleResetFilter = () => {
    filterForm.resetFields()
    setFilters({})
    setCurrentPage(1)
    message.success('筛选条件已重置')
  }
  
  // 批量选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE
    ]
  }

  // 表格列配置
  const columns = [
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 80
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'class',
      width: 120
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 80
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 60,
      render: gender => (
        <span>{gender === 'male' ? '男' : '女'}</span>
      )
    },
    {
      title: '民族',
      dataIndex: 'nationality',
      key: 'nationality',
      width: 100,
      render: nationality => {
        // 如果是代码，转换为民族名称，否则直接显示
        return parseNationalityCode(nationality) || '汉族';
      }
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 60,
      align: 'center'
    },
    {
      title: '出生日期',
      dataIndex: 'birthDate',
      key: 'birthDate',
      width: 120
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
      key: 'idCard',
      width: 180
    },
    {
      title: '全国学籍号',
      dataIndex: 'studentId',
      key: 'studentId',
      width: 200
    },
    {
      title: '教育ID',
      dataIndex: 'educationId',
      key: 'educationId',
      width: 120,
      align: 'center'
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    },
    {
      title: '家庭地址',
      dataIndex: 'address',
      key: 'address',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: status => (
        <span>{status}</span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Title level={3}>学生管理</Title>
          <div style={{ display: 'flex', gap: 10 }}>
            <Input
              placeholder="搜索学生..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <ImportExport onImportComplete={handleImportComplete} />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              添加学生
            </Button>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button 
              type="primary" 
              icon={<FilterOutlined />} 
              onClick={() => setIsFilterModalVisible(true)}
            >
              筛选
            </Button>
            <Button 
              danger 
              disabled={selectedRowKeys.length === 0} 
              onClick={handleBatchDelete}
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
            <Button 
              danger 
              onClick={handleClearData}
              disabled={students.length === 0}
            >
              清空数据
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={paginatedStudents}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredStudents.length,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 名学生`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1200, y: 600 }}
          size="middle"
        />

        {/* 添加/编辑学生弹窗 */}
        <Modal
          title={editingId ? '编辑学生' : '添加学生'}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loading}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item
                name="grade"
                label="年级"
                rules={[{ required: true, message: '请输入年级!' }]}
              >
                <Input placeholder="请输入年级" />
              </Form.Item>

              <Form.Item
                name="classId"
                label="班级"
                rules={[{ required: true, message: '请选择班级!' }]}
              >
                <Select placeholder="请选择班级">
                  {classes.map(cls => (
                    <Option key={cls.id} value={cls.id}>{cls.className}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入学生姓名!' }]}
              >
                <Input placeholder="请输入学生姓名" />
              </Form.Item>

              <Form.Item
                name="gender"
                label="性别"
                rules={[{ required: true, message: '请选择性别!' }]}
              >
                <Select placeholder="请选择性别">
                  <Option value="male">男</Option>
                  <Option value="female">女</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="nationality"
                label="民族"
              >
                <Select placeholder="请选择民族" defaultValue="1">
                  <Option value="1">汉族</Option>
                  <Option value="2">蒙古族</Option>
                  <Option value="3">回族</Option>
                  <Option value="4">藏族</Option>
                  <Option value="5">维吾尔族</Option>
                  <Option value="6">苗族</Option>
                  <Option value="7">彝族</Option>
                  <Option value="8">壮族</Option>
                  <Option value="9">布依族</Option>
                  <Option value="10">朝鲜族</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="age"
                label="年龄"
                rules={[{ required: true, message: '请输入年龄!' }]}
              >
                <InputNumber min={6} max={60} placeholder="请输入年龄" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="birthDate"
                label="出生日期"
                rules={[{ required: true, message: '请选择出生日期!' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择出生日期" />
              </Form.Item>

              <Form.Item
                name="idCard"
                label="身份证号"
                rules={[{ required: true, message: '请输入身份证号!' }]}
              >
                <Input placeholder="请输入身份证号" />
              </Form.Item>

              <Form.Item
                name="studentId"
                label="全国学籍号"
                rules={[{ required: true, message: '请输入全国学籍号!' }]}
              >
                <Input placeholder="请输入全国学籍号" />
              </Form.Item>

              <Form.Item
                name="educationId"
                label="教育ID"
                rules={[{ required: true, message: '请输入教育ID!' }]}
              >
                <Input placeholder="请输入教育ID" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="电话"
                rules={[
                  { required: true, message: '请输入电话号码!' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码!' }
                ]}
              >
                <Input placeholder="请输入电话号码" />
              </Form.Item>
            </div>

            <Form.Item
              name="address"
              label="家庭地址"
              rules={[{ required: true, message: '请输入家庭地址!' }]}
            >
              <Input.TextArea rows={3} placeholder="请输入家庭地址" />
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态!' }]}
            >
              <Select placeholder="请选择状态">
                <Option value="在学">在学</Option>
                <Option value="休学">休学</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* 筛选弹窗 */}
        <Modal
          title="高级筛选"
          open={isFilterModalVisible}
          onOk={handleFilter}
          onCancel={() => setIsFilterModalVisible(false)}
          footer={[
            <Button key="reset" onClick={handleResetFilter}>
              重置
            </Button>,
            <Button key="cancel" onClick={() => setIsFilterModalVisible(false)}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={handleFilter}>
              确定
            </Button>
          ]}
          width={600}
        >
          <Form
            form={filterForm}
            layout="vertical"
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item
              name="grade"
              label="年级"
            >
              <Select placeholder="选择年级">
                {/* 动态生成年级选项 */}
                {Array.from(new Set(students.map(s => s.grade)))
                  .filter(Boolean)
                  .sort()
                  .map(grade => (
                    <Option key={grade} value={grade}>{grade}</Option>
                  ))
                }
              </Select>
            </Form.Item>

              <Form.Item
                name="classId"
                label="班级"
              >
                <Select placeholder="选择班级">
                  {classes.map(cls => (
                    <Option key={cls.id} value={cls.id}>{cls.className}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="gender"
                label="性别"
              >
                <Select placeholder="选择性别">
                  <Option value="male">男</Option>
                  <Option value="female">女</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="status"
                label="状态"
              >
                <Select placeholder="选择状态">
                  <Option value="在学">在学</Option>
                  <Option value="休学">休学</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="ageRange"
                label="年龄范围"
              >
                <Input.Group compact>
                  <InputNumber 
                    placeholder="最小年龄" 
                    min={0} 
                    max={100} 
                    style={{ width: '45%' }}
                  />
                  <span style={{ display: 'inline-block', width: '10%', textAlign: 'center' }}>-</span>
                  <InputNumber 
                    placeholder="最大年龄" 
                    min={0} 
                    max={100} 
                    style={{ width: '45%' }}
                  />
                </Input.Group>
              </Form.Item>
            </div>
          </Form>
        </Modal>
      </Card>
    </div>
  )
}

export default Students