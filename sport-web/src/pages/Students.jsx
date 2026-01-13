import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Card, Space, Typography, InputNumber, Checkbox } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import dayjs from 'dayjs'
import { 
  addStudent, 
  updateStudent, 
  deleteStudent, 
  updateData,
  fetchStudents,
  createStudentAPI,
  updateStudentAPI,
  deleteStudentAPI,
  fetchClasses,
  createClassAPI,
  updateClassAPI,
  deleteClassAPI,
  assignStudentToClassAPI
} from '../store/dataSlice'
import ImportExport from '../components/ImportExport/ImportExport'
import { parseGradeCode, parseClassCode, generateGradeCode, generateClassCode } from '../utils/codeMapping'
import { parseNationalityCode } from '../utils/nationalityMapping'
import apiClient from '../utils/apiClient'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const Students = () => {
  const { classes, students } = useSelector(state => {
    return state.data
  })
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [filterForm] = Form.useForm()
  const [editingId, setEditingId] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [filters, setFilters] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  
  // 获取学生列表 - 使用后端API进行筛选和分页
  const fetchData = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        page_size: pageSize,
        search: searchText || undefined,
        grade: filters.grade || undefined,
        gender: filters.gender || undefined,
        status: filters.status || undefined,
        class_id: filters.classId || undefined
      }
      const result = await dispatch(fetchStudents(params)).unwrap()
      // 保存总数用于分页
      setTotal(result.total || 0)
    } catch (error) {
      message.error('获取学生列表失败')
    } finally {
      setLoading(false)
    }
  }
  
  // 加载班级列表
  const fetchClassList = async () => {
    try {
      await dispatch(fetchClasses()).unwrap()
    } catch (error) {
      console.error('获取班级列表失败:', error)
    }
  }
  
  // 加载数据（只要有 localStorage token 就加载）
  useEffect(() => {
    const authData = localStorage.getItem('auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.token) {
          fetchData();
          fetchClassList(); // 加载班级列表用于筛选
        }
      } catch (e) {
        console.error('Failed to parse auth data:', e);
      }
    }
  }, [currentPage, pageSize, searchText, filters])
  
  // 显示添加/编辑弹窗
  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id)
      // 转换日期字符串为 dayjs 对象，并正确映射状态值
      const formValues = {
        ...record,
        birthDate: record.birthDate ? dayjs(record.birthDate) : null,
        // 将后端的英文状态值转换为中文显示值
        status: record.status === 'active' ? '在学' : (record.status === 'inactive' ? '休学' : record.status),
        // 确保这些字段正确回显
        educationId: record.educationId || record.education_id || '',
        phone: record.phone || '',
        address: record.address || '',
      }
      form.setFieldsValue(formValues)
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
        // 查找班级名称
        const selectedClass = classes.find(cls => cls.id === values.classId)
        // 只存储班级名称，不包含年级信息
        const className = selectedClass ? selectedClass.className : ''
        
        // 从身份证号自动计算年龄和提取出生日期
        let age = 0;
        let birthDateStr = '';
        if (values.idCard && values.idCard.length === 18) {
          age = calculateAgeFromIdCard(values.idCard);
          // 提取出生日期
          const birthYear = values.idCard.substring(6, 10);
          const birthMonth = values.idCard.substring(10, 12);
          const birthDay = values.idCard.substring(12, 14);
          birthDateStr = `${birthYear}-${birthMonth}-${birthDay}`;
        }
        
        // 转换为后端API期望的字段格式
        const apiData = {
          student_no: values.studentId || values.idCard,  // 学籍号（使用全国学籍号或身份证号）
          real_name: values.name,                          // 姓名
          gender: values.gender,                           // 性别
          birth_date: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : birthDateStr,  // 出生日期
          id_card: values.idCard,                          // 身份证号
          enrollment_date: new Date().toISOString().split('T')[0],  // 入学日期（默认今天）
          class_id: values.classId,                        // 班级ID（新增）
          status: values.status === '在学' ? 'active' : 'inactive',
        };
        
        // 保留前端需要的额外字段（用于显示）
        let studentData = {
          ...apiData,
          age: age,
          className: className,
          grade: values.grade,
        };
        
        if (editingId) {
          // 编辑学生 - 发送所有可更新的字段（包括空值）
          const updateData = {
            real_name: values.name || null,
            gender: values.gender || null,
            birth_date: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : (birthDateStr || null),
            id_card: values.idCard || null,
            education_id: values.educationId || null,
            phone: values.phone || null,
            address: values.address || null,
            photo_url: values.photo_url || null,
            health_status: values.health_status || null,
            allergy_info: values.allergy_info || null,
            special_notes: values.special_notes || null,
            sports_level: values.sports_level || null,
            sports_specialty: values.sports_specialty || null,
            physical_limitations: values.physical_limitations || null,
            graduation_date: values.graduation_date ? values.graduation_date.format('YYYY-MM-DD') : null,
            status: values.status === '在学' ? 'active' : 'inactive',
          };
          
          dispatch(updateStudentAPI({
            id: editingId,
            studentData: updateData
          })).unwrap()
          .then(() => {
            message.success('学生信息更新成功')
            setIsModalVisible(false)
            form.resetFields()
            setEditingId(null)
            fetchData()
          })
          .catch(error => {
            message.error(error || '更新学生失败')
          })
          .finally(() => {
            setLoading(false)
          })
        } else {
          // 添加学生 - 使用后端API格式
          dispatch(createStudentAPI(apiData)).unwrap()
          .then(() => {
            message.success('学生添加成功')
            setIsModalVisible(false)
            form.resetFields()
            fetchData()
          })
          .catch(error => {
            message.error(error || '添加学生失败')
          })
          .finally(() => {
            setLoading(false)
          })
        }
      })
      .catch(info => {
        // 表单验证失败，不处理
      })
  }

  // 删除学生
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '您确定要删除这个学生吗？',
      onOk: async () => {
        setLoading(true)
        try {
          await dispatch(deleteStudentAPI(id)).unwrap()
          message.success('学生删除成功')
          fetchData()
        } catch (error) {
          message.error('删除学生失败')
        } finally {
          setLoading(false)
        }
      }
    })
  }

  // 处理导入完成
  const handleImportComplete = async (data, type, extractClasses = false) => {
    if (type === 'import-students' && data) {
      // 处理学生数据导入
      setLoading(true)
      setTimeout(async () => {
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
              // 先保存班级到数据库
              const classPromises = newClasses.map(classData => {
                // 根据年级提取年级级别 (一年级=1, 二年级=2, ...)
                const gradeLevel = parseInt(classData.grade.replace(/[^0-9]/g, '')) || 1
                
                const apiData = {
                  class_name: classData.className,
                  grade: classData.grade,
                  grade_level: gradeLevel,
                  start_date: new Date().toISOString().split('T')[0], // 当前日期
                  school_id: 1, // 默认学校ID，后续可从用户配置获取
                  school_year_id: 1, // 默认学年ID，后续可从系统配置获取
                  status: classData.status || 'active'
                }
                return dispatch(createClassAPI(apiData)).unwrap()
              })
              
              try {
                await Promise.all(classPromises)
                console.log(`成功保存 ${newClasses.length} 个班级到数据库`)
                // 重新获取班级列表以获取数据库ID
                await dispatch(fetchClasses()).unwrap()
              } catch (error) {
                console.error('保存班级到数据库失败:', error)
                message.warning(`识别了 ${newClasses.length} 个班级，但保存失败: ${error}`)
              }
            }
          }

          // 重新获取最新班级列表（从数据库获取，确保有ID）
          let latestClasses = []
          try {
            const classResponse = await dispatch(fetchClasses()).unwrap()
            latestClasses = classResponse?.items || classResponse || []
            console.log('获取到最新班级列表:', latestClasses.length, '个班级')
          } catch (error) {
            console.error('获取班级列表失败:', error)
          }

          // 更新学生的classId (从最新获取的班级列表)
          const finalStudents = formattedStudents.map(student => {
            // 使用 class_name 和 grade 匹配班级
            const matchedClass = latestClasses.find(cls => {
              const clsName = cls.class_name || cls.className
              const clsGrade = cls.grade
              return clsGrade === student.grade && clsName === student.parsedClass
            });
            return {
              ...student,
              classId: matchedClass ? matchedClass.id : null,
              className: student.parsedClass, // 只存储班级名称，不包含年级信息
              parsedClass: undefined // 移除临时字段
            };
          });

          // 添加学生数据到数据库并分配班级
          let successCount = 0
          let assignSuccessCount = 0
          
          for (const student of finalStudents) {
            try {
              // 转换数据格式以匹配后端API
              const apiData = {
                student_no: student.studentId,
                real_name: student.name,
                gender: student.gender,
                birth_date: student.birthDate,
                id_card: student.idCard,
                enrollment_date: new Date().toISOString().split('T')[0],
                status: student.status === '在学' ? 'active' : 'inactive'
              }
              
              // 创建学生
              const createdStudent = await dispatch(createStudentAPI(apiData)).unwrap()
              successCount++
              
              // 如果有班级ID，将学生分配到班级
              if (student.classId && createdStudent?.id) {
                try {
                  await dispatch(assignStudentToClassAPI({
                    studentId: createdStudent.id,
                    classId: student.classId,
                    // academic_year 现在由 class 的 school_year 自动管理
                    joinDate: new Date().toISOString().split('T')[0]
                  })).unwrap()
                  assignSuccessCount++
                } catch (assignError) {
                  console.warn(`分配学生 ${student.name} 到班级失败:`, assignError)
                }
              }
            } catch (error) {
              console.error(`创建学生 ${student.name} 失败:`, error)
            }
          }

          // 重新获取学生列表以确保数据同步
          fetchData()

          // 显示导入结果
          let messageText = `成功导入 ${successCount} 条学生数据`;
          if (assignSuccessCount > 0) {
            messageText += `，${assignSuccessCount} 名学生已分配班级`;
          }
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
      setTimeout(async () => {
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

          // 保存班级数据到数据库
          if (formattedClasses.length > 0) {
            const classSavePromises = formattedClasses.map(classData => {
              // 转换数据格式以匹配后端API
              const apiData = {
                class_name: classData.className,
                grade: classData.grade,
                grade_level: (() => {
                  const gradeLevelMap = {
                    '一年级': 1, '二年级': 2, '三年级': 3, '四年级': 4, '五年级': 5, '六年级': 6,
                    '初一年级': 7, '初二年级': 8, '初三年级': 9,
                    '高一年级': 10, '高二年级': 11, '高三年级': 12
                  }
                  return gradeLevelMap[classData.grade] || 1
                })(),
                class_teacher_name: classData.coach,
                assistant_teacher_name: classData.physicalTeacher,
                max_student_count: 60,
                start_date: new Date().toISOString().split('T')[0], // 使用当前日期作为开始日期
                school_id: 1, // 使用默认学校ID
                school_year_id: 1 // 使用活跃的学年ID
              }
              return dispatch(createClassAPI(apiData)).unwrap()
            })

            try {
              await Promise.all(classSavePromises)
              // 重新获取班级数据
              await dispatch(fetchClasses()).unwrap()
              message.success(`成功导入 ${formattedClasses.length} 条班级数据`)
            } catch (error) {
              message.error('保存班级数据到数据库失败：' + error)
              return
            }
          }
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
          // 使用student.grade作为年级，student.className作为班级
          const gradeName = student.grade;
          const className = student.className;
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

  // 过滤学生列表 - 直接使用后端返回的数据，无需前端二次过滤
  // students 已经是后端根据筛选条件返回的数据
  
  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的学生')
      return
    }
    
    Modal.confirm({
      title: '确认批量删除',
      content: `您确定要删除选中的 ${selectedRowKeys.length} 名学生吗？`,
      onOk: async () => {
        setLoading(true)
        try {
          await Promise.all(selectedRowKeys.map(id => dispatch(deleteStudentAPI(id)).unwrap()))
          setSelectedRowKeys([])
          message.success(`成功删除 ${selectedRowKeys.length} 名学生`)
          fetchData()
        } catch (error) {
          message.error('删除学生失败')
        } finally {
          setLoading(false)
        }
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
      onOk: async () => {
        setLoading(true)
        try {
          // 批量删除所有学生
          const allStudentIds = students.map(student => student.id)
          await Promise.all(allStudentIds.map(id => dispatch(deleteStudentAPI(id)).unwrap()))
          setSelectedRowKeys([])
          message.success('所有学生数据已清空')
          fetchData()
        } catch (error) {
          message.error('清空学生数据失败')
        } finally {
          setLoading(false)
        }
      }
    })
  }
  
  // 处理筛选 - 重新构建逻辑
  const handleFilter = () => {
    filterForm.validateFields()
      .then(values => {
        const newFilters = {}
        // 只保留有值的筛选条件
        if (values.grade) newFilters.grade = values.grade
        if (values.classId) newFilters.classId = values.classId
        if (values.gender) newFilters.gender = values.gender
        // 状态需要转换为后端使用的英文值
        if (values.status) {
          newFilters.status = values.status === '在学' ? 'active' : 'inactive'
        }
        
        setFilters(newFilters)
        setCurrentPage(1) // 筛选后回到第一页
        message.success('筛选条件已应用')
      })
      .catch(info => {
        // 验证失败
      })
  }
  
  // 重置筛选
  const handleResetFilter = () => {
    filterForm.resetFields()
    setFilters({})
    setSearchText('')
    setCurrentPage(1)
    message.success('筛选条件已重置')
  }

  // 处理搜索
  const handleSearch = (value) => {
    setSearchText(value)
    setCurrentPage(1)
  }

  // 判断是否有活跃筛选条件
  const hasActiveFilters = Object.keys(filters).length > 0 || searchText
  
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
        <span>{status === 'active' ? '在学' : (status === 'inactive' ? '休学' : status)}</span>
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
            <Input.Search
              placeholder="搜索学生姓名、学籍号..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              allowClear
              style={{ width: 250 }}
              enterButton
            />
            <ImportExport onImportComplete={handleImportComplete} />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              添加学生
            </Button>
          </div>
        </div>

        {/* 筛选条件区域 - 内联显示 */}
        <div style={{ marginBottom: 16, background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
          <Form
            form={filterForm}
            layout="inline"
            style={{ flexWrap: 'wrap', gap: 8 }}
          >
            <Form.Item name="grade" label="年级" style={{ marginBottom: 8 }}>
              <Select placeholder="全部年级" allowClear style={{ width: 120 }}>
                <Option value="一年级">一年级</Option>
                <Option value="二年级">二年级</Option>
                <Option value="三年级">三年级</Option>
                <Option value="四年级">四年级</Option>
                <Option value="五年级">五年级</Option>
                <Option value="六年级">六年级</Option>
                <Option value="七年级">七年级</Option>
                <Option value="八年级">八年级</Option>
                <Option value="九年级">九年级</Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="classId" label="班级" style={{ marginBottom: 8 }}>
              <Select placeholder="全部班级" allowClear style={{ width: 120 }}>
                {classes.map(cls => (
                  <Option key={cls.id} value={cls.id}>{cls.className || cls.class_name}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item name="gender" label="性别" style={{ marginBottom: 8 }}>
              <Select placeholder="全部" allowClear style={{ width: 100 }}>
                <Option value="male">男</Option>
                <Option value="female">女</Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="status" label="状态" style={{ marginBottom: 8 }}>
              <Select placeholder="全部" allowClear style={{ width: 100 }}>
                <Option value="在学">在学</Option>
                <Option value="休学">休学</Option>
              </Select>
            </Form.Item>
            
            <Form.Item style={{ marginBottom: 8 }}>
              <Space>
                <Button type="primary" icon={<FilterOutlined />} onClick={handleFilter}>
                  筛选
                </Button>
                <Button onClick={handleResetFilter} disabled={!hasActiveFilters}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Space>
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
          dataSource={students}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 名学生`,
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
            initialValues={{ nationality: '1' }}
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
                <Select placeholder="请选择民族">
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
                rules={editingId ? [] : [{ required: true, message: '请输入教育ID!' }]}
              >
                <Input placeholder="请输入教育ID" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="电话"
                rules={editingId ? [
                  { pattern: /^(1[3-9]\d{9})?$/, message: '请输入有效的手机号码!' }
                ] : [
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
              rules={editingId ? [] : [{ required: true, message: '请输入家庭地址!' }]}
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
      </Card>
    </div>
  )
}

export default Students