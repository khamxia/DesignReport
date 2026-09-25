ปรับปรุงหน้าเว็บไซต์จากเวอร์ชันปัจจุบัน โดยเน้นให้ UI สวย ทันสมัย เป็นระเบียบ และใช้งานง่ายขึ้น โดยมีรายละเอียดดังนี้

## 1. Vehicle Detail

ออกแบบหน้า **รายละเอียดรถ** ใหม่ทั้งหมด

ไม่ต้องแบ่งเป็น Card เล็ก ๆ หลายใบ ให้ใช้ **Large Main Card เพียง 1 ใบ** เป็นพื้นที่หลักของหน้า

ภายใน Card เดียวให้จัดข้อมูลเป็น Section ที่ชัดเจน เช่น:

* รูปภาพรถ / Gallery
* License Plate
* Brand / Model
* Vehicle Type
* Year
* Chassis Number
* Engine Number
* Fuel Type
* Transmission
* Seat Capacity
* Engine Power
* Owner Location
* Current Location
* Ownership Type
* Usage Type
* Assigned User
* Registered Name
* Purchase Information
* Initial Mileage

จัด Layout ให้ดู Modern และมี Visual Hierarchy ที่ชัดเจน โดยข้อมูลสำคัญ เช่น License Plate, Brand, Model, Status และ Mileage ต้องมองเห็นได้ง่าย

ภายในหน้าเดียวกันยังสามารถมี Tabs สำหรับข้อมูลที่เกี่ยวข้อง เช่น:

* Overview
* Repairs
* Maintenance Plans
* Documents
* Images
* History

แต่ส่วนข้อมูลหลักของรถต้องอยู่ใน **Large Main Card เดียว** และไม่ทำให้หน้าเต็มไปด้วย Card เล็ก ๆ

---

# 2. Repair List

ปรับหน้า Repair ให้เน้น **รายการซ่อม** เป็นหลัก และไม่แสดงข้อมูลที่ไม่จำเป็นมากเกินไป

### ตัด Column เหล่านี้ออกจาก Repair List:

* Category
* ค่าอะไหล่
* ค่าแรง

เพราะรายละเอียดเหล่านี้สามารถดูได้จาก Repair Detail และ Repair Items

### เพิ่ม Column ใหม่:

**Parts Due Soon / อะไหล่ใกล้ถึงกำหนด**

Column นี้ใช้แสดงว่า Repair รายการนั้นมีอะไหล่ย่อยที่ใกล้ถึงกำหนดเปลี่ยนหรือครบกำหนดแล้วหรือไม่

ตัวอย่าง:

* `0` = ไม่มีรายการที่ใกล้ถึงกำหนด
* `2 รายการ` = มีอะไหล่ 2 รายการใกล้ถึงกำหนด
* `1 รายการครบกำหนด` = มีรายการที่ถึงกำหนดแล้ว

ควรใช้ Status Badge ที่อ่านง่าย เช่น:

* Normal
* Due Soon
* Overdue

เมื่อกดเข้า Repair Detail ต้องสามารถดูได้ว่า **อะไหล่รายการใดเป็นตัวที่ใกล้ถึงกำหนด**

---

# 3. Add / Edit Repair

ปรับ Form เพิ่ม Repair ใหม่ทั้งหมดให้ใช้งานง่ายและตรงกับข้อมูลจริง

## Vehicle

ให้เลือก:

* Vehicle
* License Plate

เมื่อเลือก Vehicle แล้ว ให้แสดงข้อมูลรถที่เกี่ยวข้องโดยอัตโนมัติ เช่น Location และ Current Mileage

---

## Repair Information

ให้กรอก:

* Repair Title
* Maintenance Date
* Mileage at Service
* Description
* Invoice Number

**ไม่ต้องมี Category ใน Repair Form**

Category จะกำหนดเฉพาะตอนเพิ่ม **Repair Item / อะไหล่ย่อย**

---

# 4. Garage / Workshop

ส่วนเลือกอู่หรือร้านซ่อม ให้มีตัวเลือกแบบ Choose:

### Option 1: เลือกจากร้านที่มีอยู่

แสดง Dropdown/Search สำหรับเลือก Garage ที่บันทึกไว้แล้ว

### Option 2: ป้อนข้อมูลเอง

หากเลือก "Other / ป้อนเอง" ให้แสดงช่อง:

* Garage / Shop Name
* Phone Number
* Address

ข้อมูลร้านที่ป้อนเองต้องสามารถบันทึกไปพร้อมกับ Repair ได้

---

# 5. Currency / ค่าใช้จ่าย

ให้มี Dropdown สำหรับเลือกสกุลเงิน:

* LAK — ກີບ
* THB — บาท
* USD — ดอลลาร์

เมื่อเลือก USD ให้แสดงช่อง:

* USD Exchange Rate

และคำนวณค่าใช้จ่าย USD ตามอัตราแลกเปลี่ยนที่กรอก

แสดง:

* Total Cost
* Currency
* USD Rate
* USD Cost

โดยคำนวณจากข้อมูลจริงแบบอัตโนมัติ

---

# 6. Repair Images / Attachments

ใน Add / Edit Repair ให้มีส่วนสำหรับเพิ่มรูปภาพและไฟล์

รองรับ:

* Upload รูปภาพ
* Preview รูปภาพ
* Delete รูปภาพ
* Upload เอกสาร เช่น Invoice / Receipt

สามารถเพิ่มรูปได้หลายรูป

ตัวอย่างการใช้งาน:

* รูปรถก่อนซ่อม
* รูประหว่างซ่อม
* รูปหลังซ่อม
* รูปอะไหล่
* ใบเสร็จ
* Invoice

---

# 7. Repair Items

Repair 1 รายการสามารถมี **หลาย Repair Items**

ให้แสดงเป็นตารางหรือ Dynamic List ภายใน Repair Form

แต่ละ Item มี:

* Item Name
* Description
* Category
* Quantity
* Unit Price
* Total Price

**Category ต้องอยู่ที่ Repair Item เท่านั้น ไม่ใช่ระดับ Repair**

ตัวอย่าง:

Repair:

> เปลี่ยนระบบเบรก

Repair Items:

| Item        | Category | Qty | Unit Price | Total |
| ----------- | -------- | --: | ---------: | ----: |
| Brake Pad   | Brake    |   1 |        ... |   ... |
| Brake Disc  | Brake    |   2 |        ... |   ... |
| Brake Fluid | Fluid    |   1 |        ... |   ... |

Total Price ต้องคำนวณอัตโนมัติจาก:

**Quantity × Unit Price**

---

# 8. Repair Item Alert

แต่ละ Repair Item ต้องสามารถกำหนดการแจ้งเตือนได้แยกกัน

เพิ่ม Checkbox:

**☐ เปิดใช้งานการแจ้งเตือน**

ถ้าไม่เลือก:

> ไม่ต้องติดตามกำหนดของอะไหล่รายการนี้

ถ้าเลือก:

ให้แสดงตัวเลือก 2 แบบ:

### A. แจ้งเตือนตามระยะทาง

แสดงช่อง:

* ทุก ๆ ระยะทาง: `_____ km`
* แจ้งเตือนล่วงหน้า: `_____ km`

ตัวอย่าง:

ทุก 10,000 km
แจ้งเตือนล่วงหน้า 1,000 km

ระบบจะคำนวณ Next Due Mileage ให้โดยอัตโนมัติ

---

### B. แจ้งเตือนตามเวลา

แสดงช่อง:

* วันครบกำหนด: `__/__/____`
* แจ้งเตือนล่วงหน้า: `_____ วัน`

ตัวอย่าง:

ครบกำหนด: 30/12/2026
แจ้งเตือนล่วงหน้า: 30 วัน

ระบบจะคำนวณสถานะ:

* Normal
* Due Soon
* Overdue

โดยอัตโนมัติ

---

# 9. Repair Item Due Status

ใน Repair Detail ให้แสดงสถานะของแต่ละอะไหล่ด้วย

ตัวอย่าง:

| Item       | Next Due   | Status   |
| ---------- | ---------- | -------- |
| Engine Oil | 10,000 km  | Normal   |
| Brake Pad  | 1,000 km   | Due Soon |
| Air Filter | 01/10/2026 | Overdue  |

หากมีทั้ง Mileage และ Date ให้ระบบสามารถติดตามทั้งสองเงื่อนไข และถือว่า **ถึงกำหนดเมื่อเงื่อนไขใดเงื่อนไขหนึ่งถึงกำหนดก่อน**

---

# 10. Repair Detail

หน้า Repair Detail ต้องแสดงข้อมูลการซ่อมและ Repair Items อย่างชัดเจน

ส่วนหลัก:

### Repair Information

ข้อมูลการซ่อม

### Vehicle

ข้อมูลรถที่เกี่ยวข้อง

### Garage

ข้อมูลอู่ / ร้านซ่อม

### Repair Items

รายการอะไหล่ทั้งหมด

### Due & Alert

สถานะการแจ้งเตือนของแต่ละอะไหล่

### Cost

ค่าใช้จ่ายทั้งหมด

### Images & Attachments

รูปภาพและเอกสาร

ทุกส่วนต้องสามารถ Edit ได้ และมีปุ่ม:

* Edit
* Delete
* Update
* Add Item
* Upload Image
* Upload Attachment

---

# 11. UI Design

ปรับ UI ให้ดู:

* Modern
* Clean
* Professional
* Enterprise
* Minimal
* อ่านง่าย
* ใช้งานง่าย

ไม่ใช้ Card จำนวนมากเกินไป

ใช้พื้นที่และ Typography ให้เหมาะสม

ข้อมูลสำคัญต้องเด่น เช่น:

* License Plate
* Repair Title
* Total Cost
* Next Due
* Parts Due Soon

ใช้ Badge สำหรับสถานะ เช่น:

* Normal
* Due Soon
* Overdue

และใช้สี/ไอคอนอย่างพอดี ไม่ทำให้หน้าดูรก

---

## เป้าหมาย

ทำให้ Workflow เป็น:

**Vehicle → Repair → Repair Items → Alert / Due Tracking**

โดย Repair เป็นรายการหลัก และ Repair Items เป็นรายการย่อยที่สามารถติดตามกำหนดเปลี่ยนแยกกันได้

เมื่ออะไหล่ใกล้ถึงกำหนด ระบบต้องสามารถแสดงข้อมูลนั้นบน:

* Repair List
* Repair Detail
* Dashboard / Notification

โดยข้อมูลทั้งหมดต้องอ้างอิงจากข้อมูลจริงของ Repair และ Repair Items ไม่สร้างข้อมูลซ้ำโดยไม่จำเป็น
