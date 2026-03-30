[English](#en) | [中文](#zh)

---

<a id="en"></a>
# @talkto-me/stream : Binary Network Stream Parsing Framework

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Design Concept](#design-concept)
- [Tech Stack](#tech-stack)
- [Structure](#structure)
- [History](#history)

## Features

Extract fractured binary payloads and rebuild discrete data frames steadily via pure transformation piping.

## Demo

Expose frame chunks from raw reader pipes:

```javascript
import unframe from "@talkto-me/stream/unframe.js";
/* Mount decoder into response flow stream */
const reader = res.body.pipeThrough(unframe()).getReader();
const { value, done } = await reader.read();
/* Exposes sliced type and origin bytes Array */
```

## Design Concept

Maintain cumulative byte lists temporarily, calculate boundary index dynamically using shifted-MSB strategy, and safely slice payload objects recurrently.

```mermaid
graph TD
    A[Push Incoming Chunks] --> B[Concatenate Stored Buffer]
    B --> C{Run Detector vbD.js}
    C -- Check Length Fail --> D[Hold and Wait]
    C -- Shift Offset Success --> E[Extract Sliced Package]
    E --> F[Dispatch Output Map]
    F --> B
```

## Tech Stack

JavaScript, TransformStream, Uint8Array.

## Structure

- `unframe.js`: Primary framing pipe transformer logic
- `vbD.js`: Underlying MSB variant digits calculator

## History

Variant variable encoding method originated and shines vastly via early protocol-buffers specifications. Deciding continuous limits via MSB strictly prevented zero-fill wastes in basic network payloads over decades.

---

<a id="zh"></a>
# @talkto-me/stream : 二进制网络流解包框架

## 目录

- [功能](#功能)
- [使用演示](#使用演示)
- [设计思路](#设计思路)
- [技术堆栈](#技术堆栈)
- [目录结构](#目录结构)
- [历史故事](#历史故事)

## 功能

承接散装网络数据，利用变长解解码拆装报文并封装原生推拉流。

## 使用演示

结合 Web API使用：

```javascript
import unframe from "@talkto-me/stream/unframe.js";
/* 对下路长链接推送结果执行数据剥离与复原 */
const reader = res.body.pipeThrough(unframe()).getReader();
const { value, done } = await reader.read();
/* 输出包含 type 以及 Uint8Array 类型 data */
```

## 设计思路

内部使用缓存流暂存合并跨信道不完整推流，借助变长规则测长；判定成功则切段输出。

```mermaid
graph TD
    A[提取网络流入片 chunk] --> B[写入内部合并缓冲区]
    B --> C{进入解码层 vbD.js}
    C -- 边界溢出匹配失败 --> D[阻断等待后推数据]
    C -- 获取正确步长信息 --> E[自缓冲池剥离封包]
    E --> F[发布类型信息与流片]
    F --> B
```

## 技术堆栈

JavaScript, TransformStream, Uint8Array.

## 目录结构

- `unframe.js`: 拆包通道转换流主逻辑
- `vbD.js`: 底层 vbyte 类型变长位数探测提取代码

## 历史故事

变宽整形压缩（Varint）广泛应用于古老到当代的顶级序列化引擎（如 Protobuf），通过提取字节里 MSB 最高位的掩码去指示数据连贯性结束与否。这套法则用少量代码和极端节省的底层通讯流量大幅改善了宽带紧缺年代网络堵塞的问题。
