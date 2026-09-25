ต่อยอดจากระบบ **Vehicle Management System / ระบบจัดการยานพาหนะ** เดิม โดยใช้ **Next.js + TypeScript + Tailwind CSS + Demo Data / Mock Data**

ต้องออกแบบระบบให้เป็น **Enterprise Vehicle & Maintenance Management System** ที่มีความสัมพันธ์ของข้อมูลระหว่าง:

**Dashboard → Vehicle → Maintenance Plan → Purchase/Order → Repair → Parts → Expenses → Payment → Documents → Notification → Reports**

เป้าหมายสำคัญคือ ข้อมูลของแต่ละส่วนต้องเชื่อมโยงกัน และผู้ใช้สามารถเริ่มจาก “รถ 1 คัน” แล้วดูประวัติทั้งหมดของรถคันนั้นได้

Primary Color:

**#1565C0**

ใช้ภาษาไทยเป็นหลักใน UI

---

# 1. Dashboard

ปรับ Dashboard ให้เป็นหน้าแรกที่สามารถมองเห็นภาพรวมของระบบได้ทันที

## KPI Cards

แสดง:

* ยานพาหนะทั้งหมด
* รถที่ใช้งานอยู่
* รถที่กำลังซ่อม
* รถที่ไม่สามารถใช้งานได้
* ค่าใช้จ่ายซ่อมบำรุง
* ค่าใช้จ่ายเอกสาร
* ค่าใช้จ่ายรวม
* งานซ่อมที่ใกล้ครบกำหนด

---

# 2. Dashboard Alerts

สร้างส่วน **รายการแจ้งเตือน / สิ่งที่ต้องดำเนินการ**

แบ่งเป็น:

### การซ่อมบำรุง

* งานซ่อมใกล้ถึงกำหนด
* งานซ่อมเกินกำหนด
* รายการซ่อมที่ต้องดำเนินการ
* รายการอะไหล่ที่ต้องสั่งซื้อ

### เอกสาร

* เอกสารหมดอายุแล้ว
* เอกสารใกล้หมดอายุ
* เอกสารที่ยังไม่มีข้อมูล
* เอกสารที่ต้องต่ออายุ

แสดง Priority:

* Critical
* High
* Medium
* Low

และสามารถกดรายการเพื่อไปยังรายละเอียดได้ทันที

---

# 3. Dashboard Recent / Quick Reports

สร้าง List ของรายงานสำคัญ เช่น:

### งานซ่อมล่าสุด

แสดง:

* รถ
* ทะเบียน
* หัวข้อการซ่อม
* วันที่
* ค่าใช้จ่าย
* สถานะ

### เอกสารหมดอายุ / ใกล้หมดอายุ

แสดง:

* รถ
* ประเภทเอกสาร
* วันหมดอายุ
* จำนวนวันที่เหลือ
* สถานะ

### ค่าใช้จ่ายล่าสุด

แสดง:

* วันที่
* รถ
* รายการ
* หมวดหมู่
* จำนวนเงิน
* สกุลเงิน

ทุก List สามารถกด **ดูทั้งหมด** เพื่อไปยัง Report ที่เกี่ยวข้อง

---

# 4. Dashboard Maintenance Summary

แสดง Chart:

### ค่าใช้จ่ายซ่อมบำรุง

แสดงแนวโน้มราย:

* วัน
* สัปดาห์
* เดือน

### สถานะงานซ่อม

Donut Chart:

* Planned
* In Progress
* Completed
* Overdue

### ค่าใช้จ่ายตามรถ

Bar Chart

### ค่าใช้จ่ายตามหมวดหมู่

Bar / Donut Chart

---

# 5. Vehicle Detail เป็นศูนย์กลางของข้อมูล

เมื่อผู้ใช้กดเข้าไปดูรถแต่ละคัน ต้องมีหน้า:

**Vehicle Detail**

ด้านบนแสดง:

* รูปรถ
* ทะเบียน
* ยี่ห้อ
* รุ่น
* ปี
* สาขา
* ประเภทการใช้งาน
* สถานะ
* เลขไมล์ปัจจุบัน
* มูลค่ารถ

---

# 6. Vehicle Detail Tabs

สร้าง Tabs:

1. Overview
2. Repair History
3. Maintenance Plan
4. Parts
5. Expenses
6. Documents
7. Timeline

---

# 7. Vehicle Timeline

สร้าง Timeline กลางของรถแต่ละคัน

ตัวอย่าง:

**15 Sep 2026**

* Maintenance Plan created

**18 Sep 2026**

* Spare parts ordered

**20 Sep 2026**

* Repair started

**20 Sep 2026**

* Parts used

**21 Sep 2026**

* Repair completed

**22 Sep 2026**

* Payment completed

ทำให้ผู้ใช้เห็นประวัติทั้งหมดของรถจาก Timeline เดียว

---

# 8. ระบบงานซ่อมบำรุง

หน้า:

**รายการซ่อมบำรุง**

สามารถดูได้หลายมุมมอง:

* By Vehicle
* By Repair Record
* By Status
* Timeline

Default View:

**By Vehicle**

ตัวอย่าง:

Toyota Hilux / ກກ-1234

แสดง:

* จำนวนครั้งที่ซ่อม
* ค่าใช้จ่ายรวม
* ซ่อมล่าสุด
* ซ่อมครั้งถัดไป
* สถานะปัจจุบัน

เมื่อกดเข้าไปจะเห็นประวัติการซ่อมทั้งหมดของรถคันนั้น

---

# 9. Repair Record

เมื่อสร้างหรือบันทึกการซ่อม ให้สร้าง Form:

### ข้อมูลหลัก

* สถานที่ซ่อม / สาขา
* ทะเบียนรถ
* หัวข้อการซ่อม
* วันที่ซ่อม
* เลขไมล์ขณะซ่อม
* รายละเอียด
* ร้านซ่อม
* ผู้รับผิดชอบ
* สถานะการซ่อม

---

# 10. Repair Shop

ช่องร้านซ่อมรองรับ 3 รูปแบบ:

### เลือกจากรายการ

แสดงร้านที่บันทึกไว้แล้ว

### เพิ่มร้านใหม่

กรอก:

* ชื่อร้าน
* เบอร์โทรศัพท์
* ที่อยู่
* หมายเหตุ

### ร้านอื่น / External

สามารถกรอกข้อมูลร้านเองได้

หากเป็นร้านใหม่ ควรสามารถเลือก:

**Save as Repair Shop**

เพื่อเก็บไว้ใช้ครั้งต่อไป

---

# 11. Repair Cost

ใน Repair Record ให้มี:

* ค่าใช้จ่ายรวม
* สกุลเงิน
* อัตราแลกเปลี่ยน
* จำนวนเงินในสกุลเงินหลักของระบบ

รองรับ:

* LAK
* THB
* USD
* VND

หากเลือก USD / THB / VND ต้องสามารถกรอก Exchange Rate ได้

ระบบคำนวณ:

**จำนวนเงิน × Exchange Rate = จำนวนเงินสกุลหลัก**

---

# 12. รูปภาพและเอกสารประกอบการซ่อม

Repair Record สามารถ Upload:

* รูปรถ
* รูปอะไหล่
* รูปความเสียหาย
* ใบเสนอราคา
* ใบเสร็จ
* ใบแจ้งหนี้
* เอกสารอื่น ๆ

แสดงเป็น Attachment Gallery

สามารถ Preview / Delete / Download ได้

---

# 13. รายการอะไหล่ / Repair Items

ส่วนนี้เป็นส่วนสำคัญ

ไม่ควรให้ผู้ใช้สร้างอะไหล่แยกหลาย Form

ให้สร้าง **1 Form สำหรับเพิ่มรายการอะไหล่** แล้วนำข้อมูลมาแสดงเป็นรายการคล้าย Invoice / Receipt

Form:

* ชื่ออะไหล่
* ประเภท
* จำนวน
* หน่วย
* ราคาต่อหน่วย
* ส่วนลด
* จำนวนเงินรวม
* หมายเหตุ

ระบบคำนวณ:

**จำนวน × ราคาต่อหน่วย = ยอดรวม**

---

# 14. Repair Parts List

หลังจากบันทึก ให้แสดงเป็น Table / Invoice-like List:

| รายการ        | ประเภท | จำนวน | ราคาต่อหน่วย | รวม | สถานะ       |
| ------------- | ------ | ----: | -----------: | --: | ----------- |
| น้ำมันเครื่อง | น้ำมัน |     5 |          ... | ... | เปลี่ยนแล้ว |
| กรองน้ำมัน    | Filter |     1 |          ... | ... | เปลี่ยนแล้ว |
| ผ้าเบรก       | Brake  |     1 |          ... | ... | รอดำเนินการ |

แต่ละรายการสามารถ:

* Edit
* Delete
* Mark as Completed
* Mark as Pending

---

# 15. สถานะของ Repair Item

แต่ละรายการอะไหล่ / งานซ่อมต้องมี Checkbox หรือ Status:

* ยังไม่ได้ดำเนินการ
* ดำเนินการแล้ว
* รอสั่งซื้อ
* สั่งซื้อแล้ว
* ได้รับของแล้ว
* ยกเลิก

เพื่อให้ผู้ใช้รู้ว่าอะไหล่รายการไหนดำเนินการถึงขั้นไหนแล้ว

---

# 16. Payment Status

ทั้ง Repair Record และแต่ละรายการค่าใช้จ่ายสามารถมีสถานะ:

* ยังไม่ได้ชำระ
* ชำระบางส่วน
* ชำระแล้ว
* ค้างชำระ

แสดง Badge ชัดเจน

สามารถบันทึก:

* วันที่ชำระ
* จำนวนเงินที่ชำระ
* วิธีชำระ
* หมายเหตุ

---

# 17. Invoice / Receipt

Repair Record สามารถมี:

**Invoice / Receipt**

เมื่อกดดูให้แสดงรายละเอียด:

* ร้านซ่อม
* รถ
* วันที่
* รายการ
* จำนวน
* ราคาต่อหน่วย
* ยอดรวม
* ภาษี / ส่วนลดถ้ามี
* ยอดสุทธิ
* สถานะชำระเงิน

สามารถ Print / Export PDF ในอนาคต

---

# 18. Maintenance Plan

สร้างหน้า:

**แผนการซ่อมบำรุง**

ผู้ใช้สามารถวางแผน:

* สัปดาห์หน้า
* เดือนหน้า
* วันที่กำหนดเอง

ข้อมูล:

* รถ
* รายการบำรุงรักษา
* วันที่คาดว่าจะซ่อม
* เลขไมล์เป้าหมาย
* รายการอะไหล่ที่ต้องใช้
* ค่าใช้จ่ายโดยประมาณ
* ผู้รับผิดชอบ
* หมายเหตุ

Status:

* Planned
* Upcoming
* In Progress
* Completed
* Overdue
* Cancelled

---

# 19. Maintenance Plan → Repair

นี่เป็น Data Flow ที่สำคัญมาก

เมื่อมี Maintenance Plan:

ตัวอย่าง:

**Toyota Hilux / 1AB-1234**

Plan:

> เปลี่ยนน้ำมันเครื่อง + เปลี่ยนกรอง

ผู้ใช้ต้องสามารถกด:

**Create Repair from Plan**

ระบบนำข้อมูลเดิมมาเติมใน Repair Form อัตโนมัติ:

* รถ
* หัวข้อ
* รายการอะไหล่
* วันที่
* เลขไมล์เป้าหมาย
* หมายเหตุ

จากนั้นผู้ใช้เติมข้อมูลจริง เช่น:

* วันที่ซ่อมจริง
* เลขไมล์จริง
* ร้านซ่อม
* ราคาจริง
* อะไหล่จริง

เมื่อ Repair เสร็จ:

**Maintenance Plan → Completed**

---

# 20. Purchase / Order Parts

เนื่องจากบางครั้งต้องสั่งอะไหล่จากภายนอกก่อนซ่อม

สร้าง Module:

**การสั่งซื้ออะไหล่ / Parts Order**

Workflow:

**Maintenance Plan → Parts Order → Receive Parts → Repair**

ข้อมูล Order:

* เลขที่ Order
* วันที่สั่ง
* รถ
* Maintenance Plan
* รายการอะไหล่
* จำนวน
* ราคาประมาณการ
* Supplier
* สถานะ

Status:

* Draft
* Requested
* Ordered
* Partially Received
* Received
* Cancelled

---

# 21. Purchase Order → Repair

เมื่อได้รับอะไหล่แล้ว ให้มีปุ่ม:

**Use in Repair**

ระบบนำรายการอะไหล่จาก Order ไปยัง Repair Record

ไม่ต้องกรอกข้อมูลซ้ำ

ตัวอย่าง:

Order:

> Brake Pad × 1

เมื่อได้รับสินค้า:

**Use in Repair**

จะเพิ่ม:

> Brake Pad × 1

เข้า Repair Record โดยอัตโนมัติ

ผู้ใช้สามารถแก้จำนวน / ราคาจริงได้หากแตกต่างจาก Order

---

# 22. Data Relationship

ออกแบบ Data Model ให้มี Relationship:

**Vehicle**

↓

**Maintenance Plan**

↓

**Parts Order**

↓

**Repair Record**

↓

**Repair Items / Parts**

↓

**Invoice / Expense**

↓

**Payment**

↓

**Maintenance History**

↓

**Next Maintenance Reminder**

ข้อมูลต้องเชื่อมโยงกันด้วย ID เช่น:

* vehicleId
* maintenancePlanId
* purchaseOrderId
* repairId
* repairItemId
* invoiceId
* paymentId

เพื่อรองรับ Backend จริงในอนาคต

---

# 23. Documents

สร้างหน้า:

**เอกสารประจำรถ**

ประเภทเอกสารหลักเป็น Fixed Document Types:

1. ค่าทาง / ค่าผ่านทาง
2. ประกันภัย
3. การตรวจสภาพทางเทคนิค
4. สมุดทะเบียนรถ
5. สัญญาเช่า / ซื้อรถ
6. หนังสือผ่านแดนของรถ

สำหรับประกันภัย ให้รองรับ:

* ลาว
* ไทย
* เวียดนาม

---

# 24. Vehicle-first Document Management

เมื่อเพิ่มเอกสาร:

**ต้องเลือกยานพาหนะก่อน**

จากนั้นแสดงรายการเอกสารของรถคันนั้น

ตัวอย่าง:

Toyota Hilux / 1AB-1234

| เอกสาร    | สถานะ         | วันเริ่มต้น | วันหมดอายุ |
| --------- | ------------- | ----------- | ---------- |
| ประกันภัย | Active        | ...         | ...        |
| ตรวจสภาพ  | Expiring Soon | ...         | ...        |
| ทะเบียนรถ | Active        | ...         | ...        |
| สัญญาเช่า | Active        | ...         | ...        |

เมื่อ Click Document:

แสดงรายละเอียดเต็ม

* ประเภท
* เลขที่เอกสาร
* วันที่เริ่ม
* วันหมดอายุ
* ค่าใช้จ่าย
* สกุลเงิน
* ไฟล์แนบ
* หมายเหตุ

---

# 25. Document Expiry Notification

ระบบต้องคำนวณวันหมดอายุ

Status:

### Expired

หมดอายุแล้ว

### Expiring Soon

ใกล้หมดอายุ

### Active

ยังไม่ใกล้หมดอายุ

กำหนด Warning เช่น:

* 90 วัน
* 60 วัน
* 30 วัน
* 7 วัน

ผู้ใช้สามารถตั้งค่าได้ว่าแต่ละประเภทเอกสารต้องแจ้งเตือนล่วงหน้ากี่วัน

---

# 26. Maintenance Reminder

รายการซ่อม / อะไหล่สามารถตั้ง Reminder ได้ 2 รูปแบบ:

### แจ้งเตือนตามระยะทาง

เช่น:

**ทุก 10,000 km**

หรือ:

**แจ้งเตือนเมื่อเหลืออีก 500 km**

### แจ้งเตือนตามเวลา

เช่น:

**ทุก 6 เดือน**

หรือ:

**แจ้งเตือนก่อนครบกำหนด 30 วัน**

สามารถเลือกได้ว่า:

☑ ตามระยะทาง
☑ ตามเวลา

หรือเลือกทั้งสองแบบ

ระบบใช้เงื่อนไขที่ถึงก่อนในการแจ้งเตือน

---

# 27. Maintenance Item Reminder

แต่ละรายการอะไหล่สามารถมี Reminder ของตัวเอง

ตัวอย่าง:

**น้ำมันเครื่อง**

* ทุก 10,000 km
* หรือ 6 เดือน

**ยางรถ**

* ทุก 50,000 km
* หรือ 3 ปี

**แบตเตอรี่**

* ทุก 2 ปี

ข้อมูล Reminder ต้องเก็บไว้กับ Maintenance Item เพื่อสร้าง Schedule ครั้งต่อไปอัตโนมัติหลังจาก Repair เสร็จ

---

# 28. Notification Center

สร้าง Notification Center กลางของระบบ

แบ่งเป็น:

### Critical

* เอกสารหมดอายุ
* งานซ่อมเกินกำหนด

### Warning

* เอกสารใกล้หมดอายุ
* งานซ่อมใกล้ครบกำหนด
* อะไหล่ใกล้ถึงรอบเปลี่ยน

### Info

* Maintenance Plan ที่กำลังจะถึง
* Order ที่ได้รับสินค้าแล้ว
* งานซ่อมที่เสร็จแล้ว

แสดงจำนวน Notification บน Header

---

# 29. Smart Dashboard

Dashboard ต้องดึงข้อมูลจาก Modules ทั้งหมด

ตัวอย่าง:

### เอกสาร

> 3 รายการหมดอายุ
> 7 รายการใกล้หมดอายุ

### Maintenance

> 5 รายการใกล้ถึงกำหนด
> 2 รายการเกินกำหนด

### Purchase

> 4 Orders กำลังรอสินค้า

### Repair

> 3 รถกำลังซ่อม
> 8 งานซ่อมเดือนนี้

### Expenses

> ค่าใช้จ่ายเดือนนี้ ฿ / ₭ / $

---

# 30. Reports Integration

ข้อมูลจากทุก Module ต้องสามารถนำไปใช้ใน Report Center ที่สร้างไว้ก่อนหน้านี้

Report ต้องสามารถดึงข้อมูลจาก:

* Vehicle
* Repair
* Repair Items
* Parts
* Parts Orders
* Maintenance Plans
* Documents
* Payments
* Expenses

ตัวอย่าง:

**Repair Expense Report**

สามารถแสดงค่าใช้จ่ายจาก Repair + Parts Order ได้ตาม Configuration

---

# 31. Search & Navigation

สร้าง Global Search

สามารถค้นหา:

* ทะเบียนรถ
* รหัสรถ
* ชื่อร้านซ่อม
* เลขที่ Repair
* เลขที่ Order
* เลขที่เอกสาร
* ชื่ออะไหล่

Search Result ต้องแสดงประเภทของข้อมูล และสามารถ Click เข้า Detail ได้ทันที

---

# 32. Demo Data

สร้าง Demo Data ที่เชื่อมโยงกันจริง

อย่างน้อย:

* 30 Vehicles
* 20 Repair Records
* 50 Repair Items
* 20 Maintenance Plans
* 15 Parts Orders
* 30 Documents
* 30 Expenses
* 20 Notifications

ข้อมูลต้องมี Relationship จริง เช่น:

Vehicle A

→ Maintenance Plan A

→ Parts Order A

→ Repair A

→ Repair Items A

→ Expense A

→ Payment A

→ Next Reminder

อย่าสร้างข้อมูลแต่ละ Module แบบสุ่มและไม่สัมพันธ์กัน

---

# 33. UI / UX

ออกแบบให้เป็น Modern Enterprise Application

Primary:

**#1565C0**

ใช้:

* Clean layout
* White / Light Gray background
* Clear hierarchy
* Compact Data Table
* Status Badge
* Timeline
* Tabs
* Drawer
* Modal
* Stepper
* KPI Cards
* Charts

หลีกเลี่ยง:

* Gradient เยอะเกินไป
* Shadow หนัก
* สีมากเกินไป
* UI ที่ดูเหมือน Landing Page

ระบบต้องดูเหมือน Software สำหรับองค์กรจริง

---

# 34. Important UX Principle

ผู้ใช้ไม่ควรต้องกรอกข้อมูลซ้ำ

ตัวอย่าง:

ถ้า Maintenance Plan มี:

> Toyota Hilux
> เปลี่ยนน้ำมันเครื่อง
> น้ำมันเครื่อง 5 ลิตร
> กรองน้ำมัน 1 ชิ้น

เมื่อกด:

**Create Repair**

ระบบต้องนำข้อมูลเหล่านี้ไปใส่ Repair Form อัตโนมัติ

และเมื่อมี Parts Order:

**Use in Repair**

ระบบต้องนำข้อมูล Order มาใส่ Repair Item โดยอัตโนมัติ

เมื่อ Repair เสร็จ:

ระบบต้องสร้าง Maintenance History และ Next Reminder

นี่คือหลักสำคัญของระบบ

---

# 35. Final Workflow

ออกแบบระบบให้รองรับ Workflow หลัก:

### กรณีวางแผนล่วงหน้า

**Maintenance Plan**

↓

**ตรวจสอบอะไหล่**

↓

**Parts Order**

↓

**Receive Parts**

↓

**Create Repair**

↓

**Repair**

↓

**Add Parts**

↓

**Invoice / Expense**

↓

**Payment**

↓

**Complete Repair**

↓

**Maintenance History**

↓

**Create Next Reminder**

---

### กรณีรถเสียและซ่อมทันที

**Vehicle**

↓

**Create Repair**

↓

**เลือก / เพิ่มร้านซ่อม**

↓

**เพิ่มรายการอะไหล่**

↓

**บันทึกค่าใช้จ่าย**

↓

**บันทึก Payment**

↓

**Complete**

↓

**สร้าง Reminder ครั้งถัดไป**

---

# 36. Final Implementation Requirement

สร้าง Functional Frontend Prototype ด้วย Demo Data

ทุกส่วนที่สำคัญต้องสามารถทดลองได้จริง:

* Create
* Edit
* Delete
* Search
* Filter
* Sort
* View Detail
* Status Change
* Checkbox
* Upload UI
* Add Parts
* Edit Parts
* Delete Parts
* Create Maintenance Plan
* Create Parts Order
* Convert Plan → Repair
* Convert Order → Repair
* Payment Status
* Notification
* Timeline
* Report
* Export UI

ยังไม่ต้องเชื่อม Backend จริง แต่ Architecture ต้องเตรียมไว้สำหรับการเชื่อม API ในอนาคต

เน้นเป็น **ระบบที่ข้อมูลเชื่อมโยงกันจริง ไม่ใช่เพียงหน้าจอ Mockup แยกกัน**

สร้าง UI ให้ผู้ใช้สามารถเข้าใจ Workflow ได้จากหน้าจอโดยไม่ต้องอ่านคู่มือจำนวนมาก
