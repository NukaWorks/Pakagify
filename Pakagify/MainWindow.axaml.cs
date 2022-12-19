using System;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using Microsoft.CodeAnalysis;

namespace Pakagify;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    public void OnNewButtonClick(object? sender, RoutedEventArgs routedEventArgs)
    {
        var newRepoWindow = new WRepositoryCreationAssistant();
        newRepoWindow.ShowDialog(this);
    }
}