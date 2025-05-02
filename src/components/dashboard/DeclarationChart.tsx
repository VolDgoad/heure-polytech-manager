
import { useDeclarations } from "@/context/DeclarationContext";
import { useAuth } from "@/context/AuthContext";
import { 
  ChartContainer, 
  ChartLegend, 
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useMemo } from "react";

export const DeclarationChart = () => {
  const { user } = useAuth();
  const { declarations } = useDeclarations();

  const chartData = useMemo(() => {
    // Préparer les données selon le rôle
    if (!user) return [];

    const getCountForDepartment = (departmentId: string, status: string) => {
      return declarations.filter(
        d => d.department_id === departmentId && d.status === status
      ).length;
    };

    // Pour directrice et scolarité: montrer les statistiques par département
    if (["directrice_etudes", "scolarite"].includes(user.role)) {
      // Créer un ensemble unique de départements
      const departments = new Set(declarations.map(d => d.department_id));
      
      // Transformer en format pour le graphique
      return Array.from(departments).map(deptId => {
        const deptName = declarations.find(d => d.department_id === deptId)?.departmentName || "Département";
        
        return {
          department: deptName,
          soumises: getCountForDepartment(deptId, "soumise"),
          verifiees: getCountForDepartment(deptId, "verifiee"),
          validees: getCountForDepartment(deptId, "validee"),
          approuvees: getCountForDepartment(deptId, "approuvee"),
          rejetees: getCountForDepartment(deptId, "rejetee")
        };
      });
    }
    
    // Pour chef de département: uniquement son département
    if (user.role === "chef_departement" && user.department_id) {
      const deptName = declarations.find(d => d.department_id === user.department_id)?.departmentName || "Mon département";
      
      return [{
        department: deptName,
        soumises: getCountForDepartment(user.department_id, "soumise"),
        verifiees: getCountForDepartment(user.department_id, "verifiee"),
        validees: getCountForDepartment(user.department_id, "validee"),
        approuvees: getCountForDepartment(user.department_id, "approuvee"),
        rejetees: getCountForDepartment(user.department_id, "rejetee")
      }];
    }
    
    // Pour enseignants: statistiques globales de leurs déclarations
    const statusCounts = {
      brouillons: declarations.filter(d => d.teacher_id === user.id && d.status === "brouillon").length,
      soumises: declarations.filter(d => d.teacher_id === user.id && d.status === "soumise").length,
      verifiees: declarations.filter(d => d.teacher_id === user.id && d.status === "verifiee").length,
      validees: declarations.filter(d => d.teacher_id === user.id && d.status === "validee").length,
      approuvees: declarations.filter(d => d.teacher_id === user.id && d.status === "approuvee").length,
      rejetees: declarations.filter(d => d.teacher_id === user.id && d.status === "rejetee").length
    };
    
    return [
      { status: "Brouillons", count: statusCounts.brouillons },
      { status: "Soumises", count: statusCounts.soumises },
      { status: "Vérifiées", count: statusCounts.verifiees },
      { status: "Validées", count: statusCounts.validees },
      { status: "Approuvées", count: statusCounts.approuvees },
      { status: "Rejetées", count: statusCounts.rejetees }
    ];
  }, [user, declarations]);

  // Si pas assez de données, ne pas afficher le graphique
  if (chartData.length === 0 || chartData.every(d => Object.values(d).every(v => typeof v === 'number' ? v === 0 : false))) {
    return (
      <div className="flex items-center justify-center h-60 bg-gray-50/50 rounded-md">
        <p className="text-gray-500 text-sm">Pas assez de données pour afficher le graphique</p>
      </div>
    );
  }

  const getChartTitle = () => {
    switch (user?.role) {
      case "chef_departement":
        return "Statistiques des déclarations de votre département";
      case "scolarite":
        return "Statistiques des déclarations par département";
      case "directrice_etudes":
        return "Vue globale des déclarations par département";
      default:
        return "État de vos déclarations";
    }
  };

  // Configuration selon le rôle
  const config = {
    soumises: { 
      label: "Soumises", 
      color: "#3b82f6" // blue-500
    },
    verifiees: { 
      label: "Vérifiées", 
      color: "#8b5cf6" // purple-500
    },
    validees: { 
      label: "Validées", 
      color: "#f59e0b" // amber-500
    },
    approuvees: { 
      label: "Approuvées", 
      color: "#10b981" // emerald-500
    },
    rejetees: { 
      label: "Rejetées", 
      color: "#ef4444" // red-500
    },
    brouillons: { 
      label: "Brouillons", 
      color: "#6b7280" // gray-500
    },
    count: {
      label: "Nombre",
      color: "#4f46e5" // indigo-600
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">{getChartTitle()}</h3>
      <div className="bg-white p-0">
        <div className="h-64">
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              {user?.role === "enseignant" ? (
                // Graphique pour les enseignants
                <BarChart data={chartData} barGap={2} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="status" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6b7280' }}
                    dy={10}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '6px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill={config.count.color} 
                    radius={[4, 4, 0, 0]} 
                    name="Nombre"
                  />
                </BarChart>
              ) : (
                // Graphique pour les administrateurs
                <BarChart data={chartData} barGap={4} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="department" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6b7280' }}
                    dy={10}
                  />
                  <YAxis 
                    allowDecimals={false}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '6px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                  {["verifiees", "validees", "approuvees"].map((status) => (
                    <Bar 
                      key={status} 
                      dataKey={status} 
                      fill={config[status as keyof typeof config].color}
                      radius={[4, 4, 0, 0]}
                      name={config[status as keyof typeof config].label}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};
