#!/bin/bash

echo "🔧 修复Git提交消息格式问题"
echo "================================"

# 检查当前git状态
echo "📋 当前Git状态："
git status --short

echo ""
echo "📝 根据错误信息，你的项目要求使用以下提交消息格式："
echo ""
echo "格式: [<emoji>] <type>[(scope)]: <message>"
echo ""
echo "常用类型和emoji："
echo "  💥 feat: 新功能"
echo "  🐛 fix: 修复bug"
echo "  📝 docs: 文档更新"
echo "  🌷 UI: 界面改进"
echo "  🏰 chore: 构建/工具链更改"
echo "  🌐 locale: 国际化"
echo "  ♻️ refactor: 重构"
echo "  ⚡ perf: 性能优化"
echo "  🔧 workflow: 工作流程"
echo "  👷 build: 构建系统"
echo "  💚 CI: 持续集成"
echo "  ✏️ typos: 拼写错误"
echo "  ✅ tests: 测试"
echo "  🏷️ types: 类型定义"
echo "  🚧 wip: 进行中的工作"
echo "  🔖 release: 发布"
echo "  📦 dep: 依赖"

echo ""
echo "💡 基于你之前的Jenkins修复工作，建议使用以下提交消息之一："
echo ""
echo "选择1 (如果是修复Jenkins测试问题):"
echo "🐛 fix(jenkins): 修复测试命令重复参数问题"
echo ""
echo "选择2 (如果是添加测试文件):"
echo "✅ test: 添加基础测试文件和Jest配置"
echo ""
echo "选择3 (如果是Jenkins配置改进):"
echo "🔧 chore(jenkins): 改进CI/CD配置和测试设置"
echo ""
echo "选择4 (如果是修复构建问题):"
echo "👷 build: 修复Jenkins构建流程中的测试失败问题"

echo ""
echo "🚀 现在你可以选择以下操作："
echo ""
echo "1. 使用建议的提交消息重新提交："
echo "   git commit -m '🐛 fix(jenkins): 修复测试命令重复参数问题'"
echo ""
echo "2. 或者自定义提交消息（确保遵循格式）："
echo "   git commit -m '[emoji] type(scope): your message'"
echo ""
echo "3. 如果需要查看暂存的文件："
echo "   git diff --cached"
echo ""
echo "4. 如果需要修改上次提交消息："
echo "   git commit --amend"

# 提供快速提交选项
echo ""
read -p "🤔 是否要使用建议的提交消息 '🐛 fix(jenkins): 修复测试命令重复参数问题'? (y/n): " choice

if [[ $choice == "y" || $choice == "Y" ]]; then
    echo ""
    echo "🚀 执行提交..."
    git commit -m "🐛 fix(jenkins): 修复测试命令重复参数问题

- 修复Jenkinsfile中--passWithNoTests参数重复的问题
- 添加基础测试文件确保Jest能找到测试用例
- 创建Jest配置文件优化测试环境
- 改进Jenkins构建流程的错误处理"
    
    if [ $? -eq 0 ]; then
        echo "✅ 提交成功！"
        echo ""
        echo "📋 提交信息："
        git log --oneline -1
        echo ""
        echo "🚀 现在可以推送到远程仓库："
        echo "   git push"
    else
        echo "❌ 提交失败，请检查错误信息"
    fi
else
    echo ""
    echo "💡 请手动使用正确格式的提交消息："
    echo "   git commit -m '[emoji] type(scope): message'"
    echo ""
    echo "📖 参考格式文档: https://github.com/vuejs/core/blob/main/.github/commit-convention.md"
fi
EOF

chmod +x /Users/yuexixi/code/mycmdb/fix-commit.sh

## 🎯 解决方案

你的项目使用了严格的提交消息格式验证。根据错误信息和你之前的Jenkins修复工作，这里是解决方案：

### 📝 正确的提交消息格式

你需要使用以下格式：<mcreference link="https://github.com/vuejs/core/blob/main/.github/commit-convention.md" index="0">0</mcreference>